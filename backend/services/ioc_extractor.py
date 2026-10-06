import re
from typing import List, Dict, Any, Set

IPV4_PATTERN = re.compile(r'\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b')
SHA256_PATTERN = re.compile(r'\b[a-fA-F0-9]{64}\b')
MD5_PATTERN = re.compile(r'\b[a-fA-F0-9]{32}\b')
CVE_PATTERN = re.compile(r'\bCVE-\d{4}-\d{4,7}\b', re.IGNORECASE)

ATTACK_SIGNATURES = [
    (re.compile(r'(?:UNION\s+SELECT|SELECT\s+.*?\s+FROM|information_schema|1=1|OR\s+\'1\'=\'1\')', re.IGNORECASE), "SQL Injection payload"),
    (re.compile(r'(?:\.\./\.\./|\.\.\\\.\.\\|/etc/passwd|/etc/shadow|boot\.ini)', re.IGNORECASE), "Directory Traversal / File Inclusion"),
    (re.compile(r'(?:jndi:(?:ldap|rmi|dns)://)', re.IGNORECASE), "Log4Shell (CVE-2021-44228) JNDI Lookup"),
    (re.compile(r'(?:vssadmin\s+delete\s+shadows|wmic\s+shadowcopy\s+delete|bcdedit\s+/set\s+.*recoveryenabled\s+No)', re.IGNORECASE), "Ransomware Shadow Copy Deletion"),
    (re.compile(r'(?:powershell(?:\.exe)?\s+-(?:enc|encodedcommand)\s+[A-Za-z0-9+/=]+)', re.IGNORECASE), "Encoded PowerShell Execution"),
    (re.compile(r'(?:nc\s+-e|bash\s+-i\s+>&|/dev/tcp/\d+\.\d+\.\d+\.\d+)', re.IGNORECASE), "Reverse Shell Command"),
    (re.compile(r'(?:sudo\s+su|sudo\s+/bin/bash|chmod\s+777|chmod\s+\+s)', re.IGNORECASE), "Privilege Escalation Command"),
    (re.compile(r'(?:Failed\s+password\s+for\s+(?:invalid\s+user\s+)?(\w+))', re.IGNORECASE), "SSH Authentication Failure"),
    (re.compile(r'(?:Accepted\s+password\s+for\s+(\w+))', re.IGNORECASE), "SSH Successful Authentication"),
    (re.compile(r'(?:PutBucketAcl|PutBucketPolicy|AuthorizeSecurityGroupIngress|CreateAccessKey)', re.IGNORECASE), "AWS CloudTrail Critical Modification"),
]

def is_private_ip(ip: str) -> bool:
    parts = [int(p) for p in ip.split('.')]
    if parts[0] == 10:
        return True
    if parts[0] == 172 and 16 <= parts[1] <= 31:
        return True
    if parts[0] == 192 and parts[1] == 168:
        return True
    if parts[0] == 127:
        return True
    return False

def extract_iocs(logs: str) -> Dict[str, Any]:
    lines = logs.splitlines()
    
    ips: Set[str] = set()
    external_ips: Set[str] = set()
    for ip in IPV4_PATTERN.findall(logs):
        ips.add(ip)
        if not is_private_ip(ip):
            external_ips.add(ip)
            
    sha256_hashes = set(SHA256_PATTERN.findall(logs))
    md5_hashes = set(MD5_PATTERN.findall(logs))
    cves = set(CVE_PATTERN.findall(logs))
    
    signatures_found = []
    suspicious_lines = []
    
    for idx, line in enumerate(lines, 1):
        for pattern, sig_name in ATTACK_SIGNATURES:
            if pattern.search(line):
                signatures_found.append({
                    "signature": sig_name,
                    "line_number": idx,
                    "content": line.strip()
                })
                if len(suspicious_lines) < 15:
                    suspicious_lines.append((idx, line.strip()))
                break

    # Extract usernames
    usernames = set()
    for user_match in re.finditer(r'(?:for\s+user\s+(\w+)|user=(\w+)|account=(\w+)|userName":\s*"([^"]+)")', logs, re.IGNORECASE):
        groups = [g for g in user_match.groups() if g]
        if groups:
            usernames.add(groups[0])

    return {
        "all_ips": list(ips),
        "external_ips": list(external_ips),
        "sha256": list(sha256_hashes),
        "md5": list(md5_hashes),
        "cves": list(cves),
        "signatures": signatures_found,
        "suspicious_lines": suspicious_lines,
        "usernames": list(usernames),
        "line_count": len(lines),
    }
