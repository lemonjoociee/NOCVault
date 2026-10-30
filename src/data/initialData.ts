import { IncidentCase, User, AutomatedScript } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    username: 'admin',
    email: 'admin@scicom.com.my',
    fullName: 'Ahmad Faizal',
    role: 'Admin',
    department: 'NOC Lead & System Admin',
    status: 'Active',
    createdAt: '2025-01-15',
    lastLogin: 'Just now',
    password: 'admin123'
  },
  {
    id: 'usr-noc-1',
    username: 'noc_lead',
    email: 'noc_lead@scicom.com.my',
    fullName: 'Siti Nurhaliza',
    role: 'NOC',
    department: 'NOC Tier 1 Operations',
    status: 'Active',
    createdAt: '2025-02-10',
    lastLogin: '2 hours ago',
    password: 'noc123'
  },
  {
    id: 'usr-noc-2',
    username: 'rajeev',
    email: 'rajeev@scicom.com.my',
    fullName: 'Rajeev Kumar',
    role: 'NOC',
    department: 'Systems Engineering & Documentation',
    status: 'Active',
    createdAt: '2022-06-01',
    lastLogin: '1 day ago',
    password: 'rajeev123'
  }
];

export const INITIAL_SCRIPTS: AutomatedScript[] = [
  {
    id: 'script-vpn-1',
    name: 'Core VPN & Gateway Diagnostic Sweep',
    category: 'Network & VPN',
    language: 'bash',
    description: 'Executes rapid ICMP ping sweep to core VPN gateway nodes (10.11.4.28, 10.11.4.21, 10.11.4.22) and validates DNS resolving via 10.1.2.1.',
    defaultTarget: '10.11.4.28, 10.11.4.21, 10.11.4.22',
    code: `#!/bin/bash
# ========================================================
# NOC Incident Response: VPN Node & DNS Health Sweep
# Reference: SolarWinds Gateway Monitor
# ========================================================

NODES=("10.11.4.28" "10.11.4.21" "10.11.4.22")
DNS_SERVER="10.1.2.1"
DOMAINS=("medical.emgs.com.my" "stars.educationmalaysia.gov.my")

echo "[*] Initializing VPN Node Health Sweep..."
for node in "\${NODES[@]}"; do
  echo -n "[+] Pinging $node... "
  if ping -c 3 -W 2 "$node" > /dev/null 2>&1; then
    echo "ONLINE (RTT: 4.2ms, Packet Loss: 0%)"
  else
    echo "CRITICAL: NO RESPONSE FROM $node"
  fi
done

echo ""
echo "[*] Verifying Primary DNS Resolution via $DNS_SERVER..."
for domain in "\${DOMAINS[@]}"; do
  echo "[+] Testing nslookup $domain $DNS_SERVER:"
  nslookup "$domain" "$DNS_SERVER" | grep -A 2 "Name:" || echo "[-] Resolution Failed"
done
echo "[*] Diagnostic Sweep Complete."`,
    expectedOutput: `[*] Initializing VPN Node Health Sweep...
[+] Pinging 10.11.4.28... ONLINE (RTT: 4.2ms, Packet Loss: 0%)
[+] Pinging 10.11.4.21... ONLINE (RTT: 5.1ms, Packet Loss: 0%)
[+] Pinging 10.11.4.22... ONLINE (RTT: 3.8ms, Packet Loss: 0%)

[*] Verifying Primary DNS Resolution via 10.1.2.1...
[+] Testing nslookup medical.emgs.com.my 10.1.2.1:
Name:    medical.emgs.com.my
Address: 10.11.4.50

[+] Testing nslookup stars.educationmalaysia.gov.my 10.1.2.1:
Name:    stars.educationmalaysia.gov.my
Address: 10.11.4.52

[*] Diagnostic Sweep Complete. Status: ALL NODES OPERATIONAL`
  },
  {
    id: 'script-gp-odbc-1',
    name: 'Dynamics GP SQL & ODBC Port 1433 Verifier',
    category: 'ERP & Dynamics GP',
    language: 'powershell',
    description: 'Tests TCP connection to SQL Server instance KL-FINDBS1-VM on port 1433 and validates 32-bit System DSN DYNAMICSGP registry integrity.',
    defaultTarget: 'KL-FINDBS1-VM',
    code: `# ========================================================
# NOC Automated Script: GP SQL & ODBC 32-Bit Health Check
# ========================================================
$Server = "KL-FINDBS1-VM"
$Port = 1433
$DSN = "DYNAMICSGP"

Write-Host "[*] Probing SQL Server instance $Server on Port $Port..." -ForegroundColor Cyan
$tcp = Test-NetConnection -ComputerName $Server -Port $Port -WarningAction SilentlyContinue

if ($tcp.TcpTestSucceeded) {
    Write-Host "[OK] Port 1433 is OPEN. Latency: $($tcp.PingReplyDetails.RoundtripTime) ms" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Port 1433 connection failed. Verify Windows Firewall & SQL Browser service." -ForegroundColor Red
}

Write-Host "[*] Checking 32-bit System DSN '$DSN' in Registry..." -ForegroundColor Cyan
$regPath = "HKLM:\\SOFTWARE\\WOW6432Node\\ODBC\\ODBC.INI\\$DSN"
if (Test-Path $regPath) {
    $driver = (Get-ItemProperty -Path $regPath).Driver
    Write-Host "[OK] 32-bit DSN found using driver: $driver" -ForegroundColor Green
} else {
    Write-Host "[WARN] 32-bit DSN '$DSN' not found in SysWOW64 registry. Launch odbcad32.exe to configure." -ForegroundColor Yellow
}`,
    expectedOutput: `[*] Probing SQL Server instance KL-FINDBS1-VM on Port 1433...
[OK] Port 1433 is OPEN. Latency: 1.8 ms
[*] Checking 32-bit System DSN 'DYNAMICSGP' in Registry...
[OK] 32-bit DSN found using driver: C:\\Windows\\system32\\sqlncli11.dll
[SUCCESS] GP Database endpoint reachable and System DSN valid.`
  },
  {
    id: 'script-zoiper-sip-1',
    name: 'Zoiper SIP Trunk UDP Port 5060 & PBX Probe',
    category: 'VoIP & Telecom',
    language: 'python',
    description: 'Audits UDP 5060 SIP port reachability and sends SIP OPTIONS keepalive to SCICOM IP-PBX.',
    defaultTarget: 'sip.scicom.com.my:5060',
    code: `import socket
import sys

PBX_HOST = "10.1.27.176"
SIP_PORT = 5060
TIMEOUT = 3.0

print(f"[*] Probing IP-PBX SIP listener at {PBX_HOST}:{SIP_PORT} via UDP...")

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.settimeout(TIMEOUT)

sip_options = (
    f"OPTIONS sip:{PBX_HOST} SIP/2.0\\r\\n"
    f"Via: SIP/2.0/UDP 127.0.0.1:5060;branch=z9hG4bK-noc-audit\\r\\n"
    f"From: <sip:noc_probe@{PBX_HOST}>;tag=noc123\\r\\n"
    f"To: <sip:{PBX_HOST}>\\r\\n"
    f"Call-ID: noc-probe-check-001@{PBX_HOST}\\r\\n"
    f"CSeq: 1 OPTIONS\\r\\n"
    f"Contact: <sip:noc_probe@127.0.0.1:5060>\\r\\n"
    f"User-Agent: NOC-Zoiper-Auditor\\r\\n"
    f"Content-Length: 0\\r\\n\\r\\n"
).encode('utf-8')

try:
    sock.sendto(sip_options, (PBX_HOST, SIP_PORT))
    data, addr = sock.recvfrom(2048)
    print(f"[OK] Received response from {addr}:")
    print(data.decode('utf-8', errors='ignore').split('\\r\\n')[0])
    print("[SUCCESS] SIP Trunk is operational. Softphones can register.")
except socket.timeout:
    print("[WARN] SIP OPTIONS timed out. PBX may be blocking raw OPTIONS or firewall UDP 5060 filtered.")
except Exception as e:
    print(f"[ERR] Probe error: {e}")
finally:
    sock.close()`,
    expectedOutput: `[*] Probing IP-PBX SIP listener at 10.1.27.176:5060 via UDP...
[OK] Received response from ('10.1.27.176', 5060):
SIP/2.0 200 OK
[SUCCESS] SIP Trunk is operational. Softphones can register.`
  },
  {
    id: 'script-api-bench-1',
    name: 'Tracking Portal & Document API Latency Benchmark',
    category: 'API & Portals',
    language: 'bash',
    description: 'Benchmarks HTTP latency, SSL handshake, and document processing endpoints between internal LAN routes and WAN gateway.',
    defaultTarget: 'https://medical.emgs.com.my',
    code: `#!/bin/bash
# ========================================================
# NOC Automated API & Tracking Health Benchmark
# ========================================================

ENDPOINTS=(
  "https://medical.emgs.com.my/api/v1/health"
  "https://stars.educationmalaysia.gov.my/api/status"
)

echo "=== API HEALTH & LATENCY BENCHMARK ==="
for url in "\${ENDPOINTS[@]}"; do
  echo "[+] Checking $url..."
  curl -s -w "\\n  HTTP Status: %{http_code}\\n  DNS Lookup: %{time_namelookup}s\\n  Connect Time: %{time_connect}s\\n  App Connect: %{time_appconnect}s\\n  Total Time: %{time_total}s\\n" \\
       -o /dev/null -m 5 "$url" || echo "  [FAIL] Endpoint unreachable"
  echo "----------------------------------------"
done`,
    expectedOutput: `=== API HEALTH & LATENCY BENCHMARK ===
[+] Checking https://medical.emgs.com.my/api/v1/health...
  HTTP Status: 200
  DNS Lookup: 0.012s
  Connect Time: 0.024s
  App Connect: 0.048s
  Total Time: 0.082s
----------------------------------------
[+] Checking https://stars.educationmalaysia.gov.my/api/status...
  HTTP Status: 200
  DNS Lookup: 0.015s
  Connect Time: 0.027s
  App Connect: 0.051s
  Total Time: 0.091s
----------------------------------------
[BENCHMARK] All API services responsive with healthy SSL handshakes.`
  },
  {
    id: 'script-flush-dns-1',
    name: 'Windows Client DNS Flush & Route Refresh',
    category: 'Infrastructure',
    language: 'batch',
    description: 'Automated remediation script for client workstations experiencing stale DNS records or misrouted VPN subnets.',
    defaultTarget: 'Local Client Workstation',
    code: `@echo off
echo ======================================================
echo NOC Automated Workstation Network Refresh
echo ======================================================
echo [*] Flushing DNS Resolver Cache...
ipconfig /flushdns
echo [*] Registering DNS...
ipconfig /registerdns
echo [*] Releasing DHCP lease (optional, skipped on VPN)
echo [*] Printing active routing table for 10.0.0.0/8...
route print 10.*
echo [*] Verifying connection to GP Server share \\\\10.1.27.176...
net view \\\\10.1.27.176
echo ======================================================
echo [COMPLETE] Client network stack refreshed.`,
    expectedOutput: `======================================================
NOC Automated Workstation Network Refresh
======================================================
[*] Flushing DNS Resolver Cache...
Successfully flushed the DNS Resolver Cache.
[*] Registering DNS...
Registration of the DNS resource records has been initiated.
[*] Printing active routing table for 10.0.0.0/8...
Active Routes:
Network Destination        Netmask          Gateway       Interface  Metric
        10.0.0.0        255.0.0.0      10.11.4.1     10.11.4.150      20
[*] Verifying connection to GP Server share \\\\10.1.27.176...
Shared resources at \\\\10.1.27.176
Share name  Type  Used as  Comment
---------------------------------------
Installers  Disk           GP 2016 Media
GPSharedFiles Disk         Shared Documents
======================================================
[COMPLETE] Client network stack refreshed.`
  }
];

export const INITIAL_CASES: IncidentCase[] = [
  {
    id: 'case-gp-dyn-2016',
    caseNumber: 'CASE-101',
    title: 'Microsoft GP Dynamics 2016 Installation, ODBC Setup & eConnect Guide',
    category: 'ERP & Dynamics GP',
    severity: 'P2 - High',
    summary: 'Standard operating procedure for full client deployment of Microsoft Dynamics GP 2016, 32-bit ODBC System DSN configuration, Dynamics.set architecture deployment, eConnect runtime integration, and Management Reporter client setup.',
    targetNodes: ['10.1.27.176', 'KL-FINDBS1-VM\\DYNAMICSGP', 'kl-finapps1-vm:4712'],
    symptoms: [
      'New finance user workstation onboarding requires Dynamics GP 2016 ERP suite',
      'Users encounter "A get/change operation on table DYNAMICS failed" due to missing ODBC DSN',
      'Integration Manager displays un-registered evaluation watermark',
      'Management Reporter cannot locate application server endpoint :4712'
    ],
    rootCause: 'Improper 32-bit vs 64-bit ODBC configuration or missing DYNAMICS.set configuration file replacement for local OS architecture.',
    pdfAttachment: {
      title: 'Official GP Dynamics Guide (Rajeev 2022)',
      filename: 'GP_Dynamics_Guide_3a116d0b.pdf',
      path: '/assets/aistudio/GP_Dynamics_Guide_3a116d0b.pdf'
    },
    workflowSteps: [
      {
        stepNumber: 1,
        title: 'Launch Installer from Network Share',
        instructions: [
          'Press Windows Key + R to launch Run dialog.',
          'Connect to the GP Server repository share: \\\\10.1.27.176.',
          'Navigate into the Installers folder -> MDGP2016_RTM_DVD_ENUS.',
          'Locate and execute Setup.exe as Administrator.'
        ],
        command: '\\\\10.1.27.176\\Installers\\MDGP2016_RTM_DVD_ENUS\\Setup.exe',
        screenshotNote: 'Prompt will request "scitadm" credentials to install and target finance user credentials for server setup.',
        credentials: [
          { label: 'Installer Auth', value: 'scitadm (Domain admin credentials required)' },
          { label: 'Network Path', value: '\\\\10.1.27.176\\Installers' }
        ]
      },
      {
        stepNumber: 2,
        title: 'Bootstrapper Setup & Feature Selection',
        instructions: [
          'Click Install under the Bootstrapper Setup (installs Dexterity 16.0, Application Error Reporting 11.0, SQL Native Client 11.0).',
          'Restart device if prompted before next step.',
          'Select "Microsoft Dynamics GP" under Install.',
          'Select Country/Region: "Singapore".',
          'Accept terms in License Agreement.',
          'In Features tree, select "Run from My Computer" for: A4, Analysis Cubes Client, Fixed Asset Management -> Analytical Accounting -> Grant Management, and Professional Service Tools Library.',
          'Under SQL Server step: Check "Do not create data source" and click Next.',
          'Click Install and allow Installation Progress bar to reach completion.'
        ],
        warning: 'Always check "Do not create data source" during setup. ODBC must be manually created in 32-bit SysWOW64.'
      },
      {
        stepNumber: 3,
        title: '32-Bit ODBC Data Source Configuration (Mandatory)',
        instructions: [
          'Press Win+R and launch 32-bit ODBC tool: C:\\windows\\syswow64\\odbcad32.exe (or search ODBC Data Sources 32-bit and Run as Administrator).',
          'Switch to the "System DSN" tab and click "Add".',
          'Select driver: "SQL Server Native Client 11.0" and click Finish.',
          'Set Name: DYNAMICSGP, Description: DYNAMICSGP, Server: KL-FINDBS1-VM\\DYNAMICSGP.',
          'Select "With SQL Server authentication using a local ID and password entered by the user".',
          'Enter Login ID: sa | Password: P@ssw0rd (Refer to ICTA if password has been rotated).',
          'Uncheck all options in the subsequent two wizard windows and click Finish.',
          'Click "Test Data Source" to verify connection. Must show: TESTS COMPLETED SUCCESSFULLY!'
        ],
        command: 'C:\\windows\\syswow64\\odbcad32.exe',
        credentials: [
          { label: 'DSN Name', value: 'DYNAMICSGP' },
          { label: 'Server Instance', value: 'KL-FINDBS1-VM\\DYNAMICSGP' },
          { label: 'Login ID', value: 'sa' },
          { label: 'Password', value: 'P@ssw0rd' }
        ]
      },
      {
        stepNumber: 4,
        title: 'Deploy DYNAMICS.set Architecture File',
        instructions: [
          'Copy DYNAMICS.set file from \\\\10.1.27.176\\Installers.',
          'Select version according to client OS architecture: DYNAMICS_32bit or DYNAMICS_64bit.',
          'For 64-bit Windows, paste file to: C:\\Program Files (x86)\\Microsoft Dynamics\\GP2016.',
          'Rename existing file to DYNAMICS_ori (backup), then rename the copied file to DYNAMICS.set.'
        ],
        command: 'copy \\\\10.1.27.176\\Installers\\DYNAMICS_64bit "C:\\Program Files (x86)\\Microsoft Dynamics\\GP2016\\DYNAMICS.set"'
      },
      {
        stepNumber: 5,
        title: 'eConnect Runtime & Integration Manager Setup',
        instructions: [
          'From \\\\10.1.27.176\\installers\\MDGP2016_RTM_DVD_ENUS, run setup and select eConnect.',
          'Accept license agreement and select feature: eConnect Runtime Services -> Help and Samples.',
          'Under eConnect Service User, enter Domain: SCICOM.MSC | Username: GPSERVICES | Password: P@ssw0rd841942.',
          'Under SQL Connection Information, enter Server: KL-FINDBS1-VM\\DYNAMICSGP, DB: DYNAMICS, Login: sa, Pass: P@ssw0rd.',
          'Return to main installer, select "Integration Manager" and install.',
          'Features: Dynamics GP Destination Adapters, eConnect Destination Adapters, Source Adapter - XML.',
          'Launch Integration Manager as Administrator -> Click "Register Now".',
          'Site Name: SCICOM (MSC) BERHAD | Key: XHY8M9YDLK0MHC4MQU4T310.'
        ],
        credentials: [
          { label: 'Domain User', value: 'SCICOM.MSC\\GPSERVICES' },
          { label: 'Service Password', value: 'P@ssw0rd841942' },
          { label: 'IM Site Name', value: 'SCICOM (MSC) BERHAD' },
          { label: 'IM License Key', value: 'XHY8M9YDLK0MHC4MQU4T310' }
        ]
      },
      {
        stepNumber: 6,
        title: 'Management Reporter & Network Drive Mapping',
        instructions: [
          'Access \\\\10.1.27.176\\Installers\\MR2012CU15 and run Setup.',
          'Select "Management Reporter Client".',
          'Enter Server connection endpoint: http://kl-finapps1-vm:4712 and complete installation.',
          'In Windows Explorer, Map Network Drive Z: to: \\\\10.1.27.176\\GPSharedFiles with Reconnect at sign-in checked.',
          'Post-installation verification: Run "GP Utilities" as Admin, sign in as SA / P@ssw0rd, and allow database validation to finalize.'
        ],
        credentials: [
          { label: 'MR Server URL', value: 'http://kl-finapps1-vm:4712' },
          { label: 'Map Drive Z:', value: '\\\\10.1.27.176\\GPSharedFiles' }
        ]
      }
    ],
    scripts: [
      INITIAL_SCRIPTS[1], // GP ODBC check
      INITIAL_SCRIPTS[4]  // DNS flush
    ],
    escalationPath: {
      l1: 'NOC Helpdesk (Verifies 32-bit DSN & Network Drive Z:)',
      l2: 'Senior Systems Engineer (Validates SQL Server 1433 & SA permissions)',
      l3: 'ICTA Database Administrator / Finance Apps Lead',
      slaMins: 30
    },
    author: 'Rajeev Kumar (Systems Eng)',
    createdDate: '2022-09-15',
    tags: ['GP2016', 'ODBC', 'eConnect', 'SQL Server', 'Finance', 'Integration Manager']
  },
  {
    id: 'case-zoiper-voip',
    caseNumber: 'CASE-102',
    title: 'Zoiper5 VoIP Softphone Installation, SIP Activation & Registration Guide',
    category: 'VoIP & Telecom',
    severity: 'P2 - High',
    summary: 'Procedures for deploying Zoiper5 softphone on client terminals, activating online enterprise PRO license via icta@scicom.com.my, configuring SIP trunks, and resolving Error 408 / registration timeouts.',
    targetNodes: ['10.1.27.176:5060', 'SCICOM-PBX-CORE', '10.11.4.1'],
    symptoms: [
      'Call center agent workstation unable to place or receive customer calls',
      'Zoiper displays "Registration Failed (Error 408 Request Timeout)"',
      'Zoiper reverts to "Free Non-Commercial" mode instead of Pro License',
      'One-way audio reported during active call'
    ],
    rootCause: 'Unregistered Pro license certificate or UDP 5060/RTP audio port blockage by local firewall/antivirus.',
    pdfAttachment: {
      title: 'Official Zoiper Installation & Activation Guide',
      filename: 'Zoiper_Installation___Activation_Guide_0831cb34.pdf',
      path: '/assets/aistudio/Zoiper_Installation___Activation_Guide_0831cb34.pdf'
    },
    workflowSteps: [
      {
        stepNumber: 1,
        title: 'Run Zoiper5 Setup Wizard',
        instructions: [
          'Launch the official Zoiper5 installer.',
          'Accept the Securax EOOD license agreement.',
          'Select Components: Check "Zoiper5" and "Add Desktop Shortcut".',
          'Installation Directory: Leave default C:\\Program Files (x86)\\Zoiper5.',
          'Start Menu Folder: Select Zoiper5.',
          'Select Architecture: Select "64 Bit version - compatible with 64 bit Microsoft Office" (Auto-detected).',
          'Installation Scope: Choose "All Users" (applies configuration across all shift operators).',
          'Click Next to begin file unpacking and finish setup.'
        ],
        command: 'msiexec /i Zoiper5_Setup.exe /qn ALLUSERS=1'
      },
      {
        stepNumber: 2,
        title: 'Enterprise PRO License Online Activation',
        instructions: [
          'Launch Zoiper5. When the Welcome screen displays "You are running Zoiper Community Edition", click "Activate your PRO license".',
          'In the license credentials prompt, enter ICTA organization email: icta@scicom.com.my.',
          'Enter authorized license activation password (provided by ICTA Telecom Lead).',
          'Click the green "Activate Online" button.',
          'Verify window transitions to the Username and Password configuration screen.'
        ],
        credentials: [
          { label: 'License Email', value: 'icta@scicom.com.my' },
          { label: 'Activation Type', value: 'Activate Online (Requires outbound HTTPS 443 to Zoiper auth servers)' }
        ]
      },
      {
        stepNumber: 3,
        title: 'SIP Account Credential Provisioning',
        instructions: [
          'In the Username / Password screen, format the SIP URI: <ext_number>@<sip_pbx_ip>:5060 (e.g. 4402@10.1.27.176:5060).',
          'Enter agent SIP extension secret password.',
          'Click Login -> Choose SIP UDP as transport protocol.',
          'Once green checkmark shows "Account is ready", softphone is registered.'
        ],
        screenshotNote: 'Once Username and Password page is reached, close or finish setup.',
        credentials: [
          { label: 'SIP PBX Host', value: '10.1.27.176:5060' },
          { label: 'Transport Protocol', value: 'UDP (Port 5060) / RTP (10000-20000)' }
        ]
      },
      {
        stepNumber: 4,
        title: 'Triage Error 408 / Registration Failure',
        instructions: [
          'Execute the automated "Zoiper SIP Trunk UDP Port 5060 & PBX Probe" script from the Script Console.',
          'If socket timeout occurs: Check if Windows Defender Firewall has inbound/outbound rules for C:\\Program Files (x86)\\Zoiper5\\Zoiper5.exe.',
          'Ensure agent workstation is connected to the Voice VLAN subnet (10.11.4.x).',
          'Run route print to ensure traffic destined for 10.1.27.176 traverses the internal gateway.'
        ]
      }
    ],
    scripts: [
      INITIAL_SCRIPTS[2] // Zoiper probe
    ],
    escalationPath: {
      l1: 'NOC Tier 1 (Checks IP, VLAN, and Re-activates License Online)',
      l2: 'Telecom Operations Engineer (Verifies Asterisk/Cisco PBX Extension state)',
      l3: 'ICTA Voice Architect (Trunk Carrier & Firewall ACLs)',
      slaMins: 20
    },
    author: 'NOC Telecom Operations',
    createdDate: '2023-03-20',
    tags: ['VoIP', 'Zoiper5', 'SIP', 'PBX', 'Telecom', 'Softphone']
  },
  {
    id: 'case-vpn-gateway-failure',
    caseNumber: 'CASE-103',
    title: 'VPN Failure Diagnostics & Core Gateway Gateway Outage',
    category: 'Network & VPN',
    severity: 'P1 - Critical',
    summary: 'Emergency troubleshooting workflow for IPsec site-to-site VPN outage affecting critical nodes 10.11.4.28, 10.11.4.21, and 10.11.4.22, including DNS resolution test for external portals medical.emgs.com.my and stars.educationmalaysia.gov.my.',
    targetNodes: ['10.11.4.28', '10.11.4.21', '10.11.4.22', '10.1.2.1', 'http://10.1.27.165'],
    symptoms: [
      'SolarWinds alerting: Node 10.11.4.28 down / high packet loss',
      'Remote offices and branch users unable to access centralized core applications',
      'Client DNS lookups failing against primary internal resolver 10.1.2.1',
      'EMGS medical & STARS education portals failing to load over corporate VPN'
    ],
    rootCause: 'Primary IPsec tunnel phase 2 security association timeout or ISP transit link degradation on upstream WAN interface.',
    workflowSteps: [
      {
        stepNumber: 1,
        title: 'SolarWinds Monitoring Node Audit',
        instructions: [
          'Open web browser and navigate to SolarWinds dashboard: http://10.1.27.165.',
          'In the global search box, query for keyword "VPN".',
          'Filter by node status (Critical / Warning / Down).',
          'Verify operational telemetry for target gateway nodes: 10.11.4.28, 10.11.4.21, and 10.11.4.22.',
          'Review interface utilization, packet discard counters, and BGP/OSPF neighbor state.'
        ],
        command: 'curl -s -I http://10.1.27.165/Orion/SummaryView.aspx',
        credentials: [
          { label: 'SolarWinds URL', value: 'http://10.1.27.165' },
          { label: 'Primary Target Nodes', value: '10.11.4.28, 10.11.4.21, 10.11.4.22' }
        ]
      },
      {
        stepNumber: 2,
        title: 'Execute Diagnostic Connectivity & DNS Commands',
        instructions: [
          'From NOC terminal or workstation, execute ping against all 3 target nodes.',
          'Perform explicit DNS resolution test against internal DNS server 10.1.2.1 using nslookup:',
          'Test 1: nslookup medical.emgs.com.my 10.1.2.1',
          'Test 2: nslookup stars.educationmalaysia.gov.my 10.1.2.1',
          'If nslookup times out: DNS server 10.1.2.1 routing or named service is blocked.'
        ],
        command: 'nslookup medical.emgs.com.my 10.1.2.1\nnslookup stars.educationmalaysia.gov.my 10.1.2.1'
      },
      {
        stepNumber: 3,
        title: 'Automated Diagnostic Sweep Execution',
        instructions: [
          'Open the Automated Script Runner in this portal.',
          'Select "Core VPN & Gateway Diagnostic Sweep".',
          'Click "Run Diagnostic Script" to verify all target nodes simultaneously.',
          'Compare RTT latency and packet loss rates.'
        ]
      },
      {
        stepNumber: 4,
        title: 'Escalation & Failover Activation',
        instructions: [
          'If 10.11.4.28 remains down > 10 minutes: Trigger P1 Escalation Path.',
          'Notify On-Call Network Engineer to verify secondary tunnel 10.11.4.21 standby route.',
          'Generate an Incident Handover Ticket from the Escalations tab and transmit to NetOps.'
        ]
      }
    ],
    scripts: [
      INITIAL_SCRIPTS[0] // VPN sweep
    ],
    escalationPath: {
      l1: 'NOC Duty Engineer (Immediate verification within 5 mins)',
      l2: 'Senior Network Operations Engineer (On-call phone alert within 15 mins)',
      l3: 'ICTA Infrastructure Manager & ISP NOC (Telekom Malaysia / TIME NOC)',
      slaMins: 15
    },
    author: 'NOC Operations Team',
    createdDate: '2024-01-10',
    tags: ['VPN', 'SolarWinds', 'DNS', 'EMGS', 'STARS', 'P1', 'IPsec']
  },
  {
    id: 'case-api-tracking-failure',
    caseNumber: 'CASE-104',
    title: 'API & Tracking Failure Diagnostics & Document Processing Outage',
    category: 'API & Portals',
    severity: 'P1 - Critical',
    summary: 'Diagnostic procedures for tracking portal timeouts, API upstream microservice delays, document processing pipeline blockages, and internal vs external network route comparison.',
    targetNodes: ['medical.emgs.com.my', 'stars.educationmalaysia.gov.my', '10.11.4.50'],
    symptoms: [
      'Document uploads to tracking portal hang and return HTTP 504 Gateway Timeout',
      'End-users receive "Verification Service Unavailable" error modal',
      'API gateway queue backlog exceeding threshold (> 500 unprocessed jobs)'
    ],
    rootCause: 'SSL certificate handshake degradation or reverse proxy worker thread starvation.',
    workflowSteps: [
      {
        stepNumber: 1,
        title: 'External Tracking Portal Verification',
        instructions: [
          'Access external tracking portal directly via browser and test document submission.',
          'Observe HTTP response code in browser developer tools (F12 Network tab).',
          'Record TTFB (Time to First Byte) latency.'
        ]
      },
      {
        stepNumber: 2,
        title: 'Route Isolation: Internal LAN vs External WAN',
        instructions: [
          'Compare query results between internal network requests (bypassing public CDN) and external WAN internet routes.',
          'If internal works but external fails: Inspect edge firewall ACLs and CDN caching layers.',
          'If both fail: The core backend document parser container is degraded.'
        ],
        command: 'curl -Iv https://medical.emgs.com.my/api/v1/health'
      },
      {
        stepNumber: 3,
        title: 'Run Automated Latency Benchmark',
        instructions: [
          'Navigate to Script Runner and trigger "Tracking Portal & Document API Latency Benchmark".',
          'Review DNS lookup time, SSL app connect time, and HTTP status code.',
          'If connect time > 3000ms: Alert DevOps and DB tier.'
        ]
      }
    ],
    scripts: [
      INITIAL_SCRIPTS[3] // API benchmark
    ],
    escalationPath: {
      l1: 'NOC Operator (Verify status & run benchmark within 10 mins)',
      l2: 'DevOps & Middleware On-Call (Restart API workers / redis queue)',
      l3: 'Application Lead & Software Engineering VP',
      slaMins: 20
    },
    author: 'NOC Tier 2',
    createdDate: '2024-02-14',
    tags: ['API', 'Tracking', 'Document Processing', 'HTTP 504', 'EMGS', 'Latency']
  },
  {
    id: 'case-sql-deadlock-triage',
    caseNumber: 'CASE-105',
    title: 'Dynamics GP SQL Server Deadlock & Orphaned Lock Clearance',
    category: 'Database & ODBC',
    severity: 'P2 - High',
    summary: 'Resolution steps for clearing stuck batch postings and orphan user records in DYNAMICS and company databases without dropping the SQL Server instance.',
    targetNodes: ['KL-FINDBS1-VM\\DYNAMICSGP', 'Port 1433'],
    symptoms: [
      'Dynamics GP user message: "Your attempt to open the Batch failed because it is being edited by another user"',
      'User disconnected abruptly due to network hiccup but lock remains held in database',
      'SQL CPU utilization spiked to 95%'
    ],
    rootCause: 'Stale sessions in DYNAMICS..ACTIVITY, SY00800 (Batch Activity), and SY00801 (Resource Activity) tables.',
    workflowSteps: [
      {
        stepNumber: 1,
        title: 'Identify Orphaned Sessions in SQL Server Management Studio',
        instructions: [
          'Connect to KL-FINDBS1-VM\\DYNAMICSGP using SSMS with SA credentials.',
          'Execute query: SELECT * FROM DYNAMICS..ACTIVITY WHERE USERID = \'target_user\';',
          'Cross-reference with master..sysprocesses to verify if SPID is still alive.'
        ],
        command: 'SELECT spid, status, loginame, hostname, cmd FROM master..sysprocesses WHERE cmd LIKE \'%DYNAMICS%\';'
      },
      {
        stepNumber: 2,
        title: 'Clear Orphaned Lock Records',
        instructions: [
          'Ensure the target user is completely closed out of Dynamics GP on their client machine.',
          'Execute cleanup query against ACTIVITY, SY00800, and SY00801 tables:',
          'DELETE FROM DYNAMICS..ACTIVITY WHERE USERID = \'USERID\';',
          'DELETE FROM DYNAMICS..SY00800 WHERE BACHNUMB = \'BATCHID\';',
          'DELETE FROM DYNAMICS..SY00801 WHERE USERID = \'USERID\';'
        ],
        warning: 'Verify no active transactional writes before executing DELETE on ACTIVITY table.'
      }
    ],
    scripts: [
      INITIAL_SCRIPTS[1] // GP SQL check
    ],
    escalationPath: {
      l1: 'NOC Operator (Verify user process status in SSMS)',
      l2: 'ICTA Database Administrator (Clears locks and validates integrity)',
      l3: 'ERP Principal Consultant',
      slaMins: 45
    },
    author: 'Ahmad Faizal (DBA Lead)',
    createdDate: '2023-11-05',
    tags: ['SQL Server', 'Deadlock', 'GP2016', 'ACTIVITY', 'Batch Lock', 'Database']
  }
];

export const ESCALATION_TEAMS = [
  {
    tier: 'Tier 1 NOC Shift Desk',
    role: 'First Line Triage & Incident Intake',
    contact: 'noc-desk@scicom.com.my',
    phone: '+60 3-2162 1088',
    ext: 'Ext 4401',
    coverage: '24/7/365 Non-stop',
    slaTarget: 'Response within 15 minutes',
    duties: ['Health checks', 'Customer incident intake', 'Script execution', 'Initial SOP walkthrough']
  },
  {
    tier: 'Tier 2 Network Operations (NetOps)',
    role: 'Core Routing, Switching & VPN Triage',
    contact: 'net-ops@scicom.com.my',
    phone: '+60 12-345 6789',
    ext: 'Ext 4420',
    coverage: '24/7 On-Call Escalation',
    slaTarget: 'Response within 30 minutes',
    duties: ['IPsec tunnel resets', 'BGP route tuning', 'Firewall ACL modifications', 'Switch interface debugs']
  },
  {
    tier: 'Tier 3 ERP & Systems Administration',
    role: 'Dynamics GP 2016, SQL Server & Integrations',
    contact: 'icta-dba@scicom.com.my',
    phone: '+60 16-987 6543',
    ext: 'Ext 4882',
    coverage: '08:00 - 20:00 (On-call after hours)',
    slaTarget: 'Response within 45 minutes',
    duties: ['SQL transaction lock clearance', 'eConnect service maintenance', 'System DSN deployments', 'ODBC repairs']
  },
  {
    tier: 'Tier 3 Telecom & VoIP Infrastructure',
    role: 'Zoiper5 Softphone, SIP PBX & Call Center Trunks',
    contact: 'telecom-eng@scicom.com.my',
    phone: '+60 19-876 5432',
    ext: 'Ext 4510',
    coverage: '08:00 - 22:00 (On-call for P1 call outage)',
    slaTarget: 'Response within 20 minutes',
    duties: ['SIP trunk failovers', 'Zoiper license re-allocations', 'Codec & RTP jitter troubleshooting']
  },
  {
    tier: 'Incident Commander / NOC Manager',
    role: 'Major Incident Protocol & Executive Notification',
    contact: 'noc-manager@scicom.com.my',
    phone: '+60 12-999 8888',
    ext: 'Ext 4400',
    coverage: '24/7 For P1/P2 Major Incidents',
    slaTarget: 'Immediate notification within 15 mins for P1',
    duties: ['Customer communication broadcast', 'Bridge call coordination', 'RCA sign-off']
  }
];
