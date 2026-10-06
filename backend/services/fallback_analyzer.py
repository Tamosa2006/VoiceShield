import re
from typing import Dict, Any, List
from .ioc_extractor import extract_iocs
from ..models import AnalysisResult, EvidenceItem, ResponseAction

def analyze_logs_heuristically(logs: str, context_notes: str = None) -> AnalysisResult:
    iocs = extract_iocs(logs)
    logs_lower = logs.lower()
    
    # 1. Check for Ransomware / Host Destruction
    if any(k in logs_lower for k in ["vssadmin", "delete shadows", "wmic shadowcopy", "recoveryenabled no"]) or \
       ("powershell" in logs_lower and ("-enc" in logs_lower or "-encodedcommand" in logs_lower)):
        return _build_ransomware_analysis(logs, iocs, context_notes)

    # 2. Check for Log4Shell / JNDI RCE
    if "jndi:" in logs_lower or "cve-2021-44228" in logs_lower:
        return _build_log4shell_analysis(logs, iocs, context_notes)

    # 3. Check for SQL Injection & Web Application Exploits
    if any(k in logs_lower for k in ["union select", "information_schema", "1=1", "sleep(", "xp_cmdshell", "drop table", "select * from"]):
        return _build_sqli_analysis(logs, iocs, context_notes)

    # 4. Check for CloudTrail / Cloud Infrastructure Abuse
    if any(k in logs_lower for k in ["putbucketacl", "createsecuritygroup", "authorizeingress", "createaccesskey", "cloudtrail", "awsexec"]):
        return _build_cloudtrail_analysis(logs, iocs, context_notes)

    # 5. Check for SSH Brute Force & Privilege Escalation
    if ("failed password" in logs_lower or "invalid user" in logs_lower or "sshd[" in logs_lower):
        return _build_ssh_bruteforce_analysis(logs, iocs, context_notes)

    # 6. Check for Directory Traversal / Path Traversal
    if "../.." in logs or "/etc/passwd" in logs or "/etc/shadow" in logs:
        return _build_traversal_analysis(logs, iocs, context_notes)

    # 7. Generic Fallback
    return _build_generic_analysis(logs, iocs, context_notes)


def _build_ssh_bruteforce_analysis(logs: str, iocs: Dict[str, Any], notes: str) -> AnalysisResult:
    attacker_ips = iocs["external_ips"] or iocs["all_ips"] or ["198.51.100.42"]
    primary_ip = attacker_ips[0]
    
    has_success = "accepted password" in logs.lower() or "session opened" in logs.lower()
    has_priv_esc = "sudo" in logs.lower() or "root" in logs.lower()
    
    if has_success and has_priv_esc:
        risk_score = 94
        severity = "CRITICAL"
        threat_type = "Distributed SSH Brute Force & Unauthorized Privilege Escalation"
        confidence = 96
        summary = (
            f"VoiceShield detected a high-volume SSH credential stuffing attack originating from {primary_ip}. "
            f"The attacker tested multiple account dictionaries before successfully authenticating and attempting "
            f"immediate privilege escalation via sudo."
        )
    elif has_success:
        risk_score = 86
        severity = "HIGH"
        threat_type = "SSH Brute Force with Successful Compromise"
        confidence = 92
        summary = (
            f"SSH brute force activity from {primary_ip} successfully compromised an active user account. "
            f"Attacker established an interactive shell session."
        )
    else:
        risk_score = 68
        severity = "MEDIUM"
        threat_type = "Inbound SSH Password Guessing / Brute Force"
        confidence = 88
        summary = (
            f"Targeted automated password guessing attack detected against SSH daemon from {primary_ip}. "
            f"All attempts appear to have been rejected."
        )

    evidence: List[EvidenceItem] = []
    evidence.append(EvidenceItem(
        ioc_type="Attacker IP Address",
        value=primary_ip,
        description="Repeated failed and/or unauthorized authentication requests originating from this host.",
        severity="CRITICAL" if has_success else "HIGH"
    ))
    
    if iocs["usernames"]:
        evidence.append(EvidenceItem(
            ioc_type="Targeted Accounts",
            value=", ".join(list(iocs["usernames"])[:4]),
            description="User accounts targeted during brute-force authentication attempts.",
            severity="MEDIUM"
        ))

    if iocs["suspicious_lines"]:
        evidence.append(EvidenceItem(
            ioc_type="Log Signature",
            value=f"Line {iocs['suspicious_lines'][0][0]}",
            description=iocs["suspicious_lines"][0][1],
            severity="HIGH",
            raw_line=iocs["suspicious_lines"][0][1]
        ))

    actions: List[ResponseAction] = [
        ResponseAction(
            step=1,
            title="Block Attacker IP in Edge Firewall",
            category="Containment",
            priority="Immediate",
            description=f"Drop all incoming traffic from {primary_ip} across gateway and host firewalls.",
            command=f"iptables -I INPUT -s {primary_ip} -j DROP"
        ),
        ResponseAction(
            step=2,
            title="Terminate Active Attacker Sessions",
            category="Containment",
            priority="Immediate",
            description="Inspect active pts sessions and terminate unauthorized interactive logins.",
            command="who -u && pkill -KILL -u $(whoami)"
        ),
        ResponseAction(
            step=3,
            title="Rotate SSH Keys & Enforce Key-Only Auth",
            category="Remediation",
            priority="High",
            description="Disable password-based SSH authentication in sshd_config and rotate all authorized keys.",
            command="sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config && systemctl reload sshd"
        ),
        ResponseAction(
            step=4,
            title="Deploy Fail2ban SSH Jail",
            category="Hardening",
            priority="Medium",
            description="Enable automated rate-limiting to ban IPs exhibiting repeated authentication failures.",
            command="systemctl enable --now fail2ban"
        )
    ]

    mitre = [
        "T1110.001 - Brute Force: Password Guessing",
        "T1078 - Valid Accounts",
        "T1548.003 - Sudo and Sudo Caching"
    ]

    voice_script = (
        f"Alert: {severity} severity incident. VoiceShield identified an SSH brute force and compromise event "
        f"originating from {primary_ip}. Target accounts were targeted, resulting in unauthorized access. "
        f"Immediate action required: Block IP {primary_ip} and terminate open shell sessions."
    )

    return AnalysisResult(
        risk_score=risk_score,
        severity=severity,
        threat_type=threat_type,
        mitre_attack=mitre,
        confidence=confidence,
        summary=summary,
        voice_briefing_script=voice_script,
        evidence=evidence,
        response_actions=actions,
        source="fallback_heuristic"
    )


def _build_sqli_analysis(logs: str, iocs: Dict[str, Any], notes: str) -> AnalysisResult:
    attacker_ips = iocs["external_ips"] or iocs["all_ips"] or ["203.0.113.88"]
    primary_ip = attacker_ips[0]

    evidence: List[EvidenceItem] = [
        EvidenceItem(
            ioc_type="Attacker Source IP",
            value=primary_ip,
            description="Origin of structured SQL injection probe requests.",
            severity="HIGH"
        ),
        EvidenceItem(
            ioc_type="Attack Signature",
            value="UNION SELECT / Schema Enumeration",
            description="Injected SQL fragments attempting database metadata exfiltration and data union.",
            severity="CRITICAL"
        )
    ]

    for line_num, content in iocs["suspicious_lines"][:2]:
        evidence.append(EvidenceItem(
            ioc_type="Offending HTTP Request",
            value=f"Line {line_num}",
            description="Web server access log line containing SQL syntax payload.",
            severity="HIGH",
            raw_line=content
        ))

    actions: List[ResponseAction] = [
        ResponseAction(
            step=1,
            title="Deploy WAF Block Rule for Source IP",
            category="Containment",
            priority="Immediate",
            description=f"Block IP {primary_ip} at the Web Application Firewall (WAF) or Cloudflare.",
            command=f"curl -X POST https://api.cloudflare.com/client/v4/zones/YOUR_ZONE/firewall/access_rules/rules -d '{{\"mode\":\"block\",\"configuration\":{{\"target\":\"ip\",\"value\":\"{primary_ip}\"}}}}'"
        ),
        ResponseAction(
            step=2,
            title="Audit DB Query Logs for Exfiltrated Records",
            category="Investigation",
            priority="High",
            description="Review MySQL / PostgreSQL general query logs to determine if queries returned unauthorized data.",
            command="grep -i 'UNION' /var/log/mysql/query.log"
        ),
        ResponseAction(
            step=3,
            title="Enforce Parameterized Queries / ORM Prepared Statements",
            category="Remediation",
            priority="High",
            description="Review endpoint source code and eliminate string-interpolated SQL statements.",
            command="git grep -n 'SELECT.*format(' or 'SELECT.*%s'"
        )
    ]

    return AnalysisResult(
        risk_score=91,
        severity="CRITICAL",
        threat_type="SQL Injection (SQLi) & Database Exfiltration Probe",
        mitre_attack=[
            "T1190 - Exploit Public-Facing Application",
            "T1005 - Data from Local System",
            "T1505 - Server Software Component"
        ],
        confidence=95,
        summary=(
            f"VoiceShield detected deliberate SQL Injection attacks targeting web application query endpoints. "
            f"Attacker at {primary_ip} probed for UNION SELECT vulnerabilities to map database schemas "
            f"and dump sensitive tables."
        ),
        voice_briefing_script=(
            f"Critical Alert: SQL Injection attack detected from IP {primary_ip}. Malicious UNION SELECT statements "
            f"were identified probing database schemas. Recommended immediate action: Apply WAF IP block and "
            f"audit database query logs for data leakage."
        ),
        evidence=evidence,
        response_actions=actions,
        source="fallback_heuristic"
    )


def _build_cloudtrail_analysis(logs: str, iocs: Dict[str, Any], notes: str) -> AnalysisResult:
    attacker_ips = iocs["external_ips"] or iocs["all_ips"] or ["198.51.100.99"]
    primary_ip = attacker_ips[0]

    evidence: List[EvidenceItem] = [
        EvidenceItem(
            ioc_type="Compromised IAM Identity",
            value="IAM User / Service Role",
            description="Unusual API calls initiated from an unapproved non-corporate IP address.",
            severity="CRITICAL"
        ),
        EvidenceItem(
            ioc_type="Unauthorized Action",
            value="PutBucketAcl / CreateAccessKey",
            description="Attacker attempted to alter S3 bucket public visibility and generate persistent credentials.",
            severity="CRITICAL"
        ),
        EvidenceItem(
            ioc_type="Origin IP",
            value=primary_ip,
            description="External client IP performing administrative AWS API operations.",
            severity="HIGH"
        )
    ]

    actions: List[ResponseAction] = [
        ResponseAction(
            step=1,
            title="Deactivate Compromised IAM Access Keys",
            category="Containment",
            priority="Immediate",
            description="Immediately disable active access keys associated with the affected IAM identity.",
            command="aws iam update-access-key --access-key-id <KEY_ID> --status Inactive"
        ),
        ResponseAction(
            step=2,
            title="Attach Explicit Deny Policy to IAM Identity",
            category="Containment",
            priority="Immediate",
            description="Prevent any ongoing API calls by attaching AWS DenyAll inline policy.",
            command="aws iam put-user-policy --user-name <USER> --policy-name Quarantine --policy-document '{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Deny\",\"Action\":\"*\",\"Resource\":\"*\"}]}'"
        ),
        ResponseAction(
            step=3,
            title="Revert S3 Bucket Public Access Block",
            category="Remediation",
            priority="High",
            description="Enable S3 Block Public Access to prevent unauthorized data exfiltration.",
            command="aws s3api put-public-access-block --bucket <BUCKET> --public-access-block-configuration 'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'"
        )
    ]

    return AnalysisResult(
        risk_score=96,
        severity="CRITICAL",
        threat_type="AWS CloudTrail Privilege Escalation & Data Exposure",
        mitre_attack=[
            "T1078.004 - Cloud Accounts",
            "T1562.001 - Impair Defenses: Disable Cloud Logs",
            "T1530 - Data from Cloud Storage Object"
        ],
        confidence=94,
        summary=(
            f"CloudTrail audit logs show high-risk security modifications executed from unexpected source {primary_ip}. "
            f"The actor invoked privileged IAM and S3 APIs, attempting to create backdoors and expose bucket assets."
        ),
        voice_briefing_script=(
            f"Critical AWS Incident: Compromised IAM credentials detected operating from {primary_ip}. "
            f"Unauthorized attempts were made to modify S3 access control lists and generate secondary access keys. "
            f"Immediately deactivate the affected IAM credentials and quarantine the role."
        ),
        evidence=evidence,
        response_actions=actions,
        source="fallback_heuristic"
    )


def _build_log4shell_analysis(logs: str, iocs: Dict[str, Any], notes: str) -> AnalysisResult:
    attacker_ips = iocs["external_ips"] or iocs["all_ips"] or ["45.154.255.8"]
    primary_ip = attacker_ips[0]

    evidence: List[EvidenceItem] = [
        EvidenceItem(
            ioc_type="Exploit Signature",
            value="CVE-2021-44228 (Log4Shell)",
            description="Inbound HTTP headers contain jndi:ldap or jndi:rmi exploit payload.",
            severity="CRITICAL"
        ),
        EvidenceItem(
            ioc_type="Hostile Source IP",
            value=primary_ip,
            description="Remote scanner sending automated JNDI callbacks.",
            severity="CRITICAL"
        )
    ]

    actions: List[ResponseAction] = [
        ResponseAction(
            step=1,
            title="Block JNDI Exploit String at Reverse Proxy / WAF",
            category="Containment",
            priority="Immediate",
            description="Drop requests containing regex pattern (jndi|ldap|rmi) in User-Agent, URI, or headers.",
            command="nginx -t && nginx -s reload"
        ),
        ResponseAction(
            step=2,
            title="Set JVM Flag to Disable Message Lookups",
            category="Remediation",
            priority="Immediate",
            description="Configure LOG4J_FORMAT_MSG_NO_LOOKUPS=true in Java runtime environment.",
            command="export LOG4J_FORMAT_MSG_NO_LOOKUPS=true"
        ),
        ResponseAction(
            step=3,
            title="Inspect Outbound Network Connections for LDAP/RMI Beacons",
            category="Investigation",
            priority="High",
            description="Verify whether target servers attempted outbound connections on ports 1389 or 389.",
            command="netstat -tupn | grep -E ':(1389|389|8000)'"
        )
    ]

    return AnalysisResult(
        risk_score=98,
        severity="CRITICAL",
        threat_type="Remote Code Execution (Log4Shell - CVE-2021-44228)",
        mitre_attack=[
            "T1190 - Exploit Public-Facing Application",
            "T1059 - Command and Scripting Interpreter",
            "T1105 - Ingress Tool Transfer"
        ],
        confidence=98,
        summary=(
            f"VoiceShield detected Log4Shell (CVE-2021-44228) exploit attempts delivered via HTTP headers from {primary_ip}. "
            f"The payload attempted JNDI remote class loading to achieve arbitrary remote code execution."
        ),
        voice_briefing_script=(
            f"Emergency Alert: Active Log4Shell remote code execution attempt detected from {primary_ip}. "
            f"Attackers are transmitting JNDI LDAP lookup strings. Immediate action: Apply reverse proxy WAF "
            f"filtering and restart JVM instances with message lookups disabled."
        ),
        evidence=evidence,
        response_actions=actions,
        source="fallback_heuristic"
    )


def _build_ransomware_analysis(logs: str, iocs: Dict[str, Any], notes: str) -> AnalysisResult:
    evidence: List[EvidenceItem] = [
        EvidenceItem(
            ioc_type="Malicious Command",
            value="vssadmin delete shadows /all /quiet",
            description="Attacker attempted to destroy Windows Volume Shadow Copies to prevent restore.",
            severity="CRITICAL"
        ),
        EvidenceItem(
            ioc_type="Execution Vector",
            value="Obfuscated Encoded PowerShell",
            description="PowerShell process launched with base64 encoded command arguments bypassing script restrictions.",
            severity="CRITICAL"
        )
    ]

    actions: List[ResponseAction] = [
        ResponseAction(
            step=1,
            title="Isolate Endpoint from Local Network Immediately",
            category="Containment",
            priority="Immediate",
            description="Sever network adapter connectivity to stop lateral movement and remote C2 encryption key retrieval.",
            command="netsh interface set interface name=\"Ethernet\" admin=disabled"
        ),
        ResponseAction(
            step=2,
            title="Terminate Malicious PowerShell & Parent PIDs",
            category="Containment",
            priority="Immediate",
            description="Kill offending script hosts and processes.",
            command="Stop-Process -Name powershell, cmd, wscript -Force"
        ),
        ResponseAction(
            step=3,
            title="Preserve Volatile RAM Memory Dump for Forensics",
            category="Investigation",
            priority="High",
            description="Acquire memory image to extract encryption keys and initial access indicators.",
            command="winpmem.exe -o memdump.raw"
        )
    ]

    return AnalysisResult(
        risk_score=99,
        severity="CRITICAL",
        threat_type="Endpoint Ransomware Activity & Shadow Copy Deletion",
        mitre_attack=[
            "T1490 - Inhibit System Recovery",
            "T1059.001 - PowerShell Execution",
            "T1486 - Data Encrypted for Impact"
        ],
        confidence=97,
        summary=(
            "VoiceShield identified active precursor indicators of ransomware execution. "
            "Commands were issued to permanently erase Volume Shadow Copies alongside encoded PowerShell scripts "
            "typical of secondary-stage payload deployment."
        ),
        voice_briefing_script=(
            "Critical Security Alert: Ransomware behavior detected. Volume Shadow Copies were purged and "
            "encoded PowerShell was executed. Immediately isolate the host from the network to prevent encryption spread."
        ),
        evidence=evidence,
        response_actions=actions,
        source="fallback_heuristic"
    )


def _build_traversal_analysis(logs: str, iocs: Dict[str, Any], notes: str) -> AnalysisResult:
    attacker_ips = iocs["external_ips"] or iocs["all_ips"] or ["198.51.100.55"]
    primary_ip = attacker_ips[0]

    return AnalysisResult(
        risk_score=78,
        severity="HIGH",
        threat_type="Path Traversal & Arbitrary File Read Probe",
        mitre_attack=[
            "T1083 - File and Directory Discovery",
            "T1005 - Data from Local System"
        ],
        confidence=90,
        summary=(
            f"VoiceShield detected dot-dot-slash directory traversal patterns targeting sensitive system files "
            f"such as /etc/passwd originating from {primary_ip}."
        ),
        voice_briefing_script=(
            f"High Severity Alert: Directory traversal attack detected from {primary_ip}. Requests attempted to escape "
            f"web roots and inspect configuration files. Recommend blocking the IP and sanitizing filepath parameters."
        ),
        evidence=[
            EvidenceItem(
                ioc_type="Targeted File",
                value="/etc/passwd or /etc/shadow",
                description="Attempt to traverse above root web directory to read sensitive credentials.",
                severity="HIGH"
            ),
            EvidenceItem(
                ioc_type="Attacker IP",
                value=primary_ip,
                description="Source of path traversal requests.",
                severity="HIGH"
            )
        ],
        response_actions=[
            ResponseAction(
                step=1,
                title="Sanitize URI Parameters in Web Application",
                category="Remediation",
                priority="Immediate",
                description="Ensure application uses basename() or path canonicalization validation before opening files."
            ),
            ResponseAction(
                step=2,
                title="Block Origin IP at Edge",
                category="Containment",
                priority="High",
                description=f"Drop traffic from {primary_ip}.",
                command=f"iptables -I INPUT -s {primary_ip} -j DROP"
            )
        ],
        source="fallback_heuristic"
    )


def _build_generic_analysis(logs: str, iocs: Dict[str, Any], notes: str) -> AnalysisResult:
    all_ips = iocs["external_ips"] or iocs["all_ips"]
    primary_ip = all_ips[0] if all_ips else "Unknown Client"
    
    evidence: List[EvidenceItem] = []
    if all_ips:
        evidence.append(EvidenceItem(
            ioc_type="Detected IP Address",
            value=primary_ip,
            description="IP address identified in event telemetry.",
            severity="MEDIUM"
        ))
    if iocs["usernames"]:
        evidence.append(EvidenceItem(
            ioc_type="Referenced User Account",
            value=list(iocs["usernames"])[0],
            description="User entity referenced in log data.",
            severity="LOW"
        ))
    if not evidence:
        evidence.append(EvidenceItem(
            ioc_type="Log Telemetry",
            value=f"{iocs['line_count']} lines evaluated",
            description="Log stream ingested and parsed for anomalous patterns.",
            severity="LOW"
        ))

    return AnalysisResult(
        risk_score=45,
        severity="MEDIUM",
        threat_type="Suspicious Security Event & Telemetry Anomaly",
        mitre_attack=[
            "T1082 - System Information Discovery",
            "T1046 - Network Service Discovery"
        ],
        confidence=80,
        summary=(
            f"VoiceShield completed analysis of {iocs['line_count']} log entries. Anomalous patterns or reconnaissance "
            f"telemetry was noted requiring analyst review."
        ),
        voice_briefing_script=(
            f"Investigation Briefing: Log telemetry analyzed. Medium risk anomalies detected involving {primary_ip}. "
            f"Standard monitoring and log baseline comparison recommended."
        ),
        evidence=evidence,
        response_actions=[
            ResponseAction(
                step=1,
                title="Cross-Reference IP with Threat Intelligence Feeds",
                category="Investigation",
                priority="Medium",
                description=f"Check {primary_ip} on AbuseIPDB or VirusTotal for known reputation flags."
            ),
            ResponseAction(
                step=2,
                title="Review Elevated Access Logs",
                category="Remediation",
                priority="Low",
                description="Verify whether any associated accounts were utilized outside normal operational hours."
            )
        ],
        source="fallback_heuristic"
    )
