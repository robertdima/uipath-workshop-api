/**
 * ITSM Console - Runbooks Module
 */

const RunbooksModule = {
    // Sample runbooks data (would normally be in ITSMData)
    runbooks: [
        {
            id: 'RB-001',
            title: 'VPN Troubleshooting Procedure',
            category: 'Network',
            description: 'Step-by-step guide to diagnose and resolve VPN connectivity issues',
            author: 'network.admin',
            lastUpdated: '2025-01-15',
            estimatedTime: '15-30 min',
            steps: [
                { id: 1, title: 'Verify VPN Client Status', description: 'Check if VPN client is running and connected', automatable: false },
                { id: 2, title: 'Check Network Connectivity', description: 'Run ping test to VPN gateway: ping vpn.acme.com', automatable: true },
                { id: 3, title: 'Verify Credentials', description: 'Confirm user credentials are valid and not expired', automatable: false },
                { id: 4, title: 'Clear VPN Cache', description: 'Delete cached certificates and reconnect', automatable: true },
                { id: 5, title: 'Check Certificate', description: 'Verify VPN certificate is valid and not expired', automatable: true },
                { id: 6, title: 'Restart VPN Service', description: 'Stop and restart VPN client service', automatable: true },
                { id: 7, title: 'Document Resolution', description: 'Record steps taken and outcome in ticket', automatable: false }
            ]
        },
        {
            id: 'RB-002',
            title: 'Password Reset Procedure',
            category: 'Identity',
            description: 'Standard procedure for resetting user passwords',
            author: 'id.admin',
            lastUpdated: '2025-02-01',
            estimatedTime: '5-10 min',
            steps: [
                { id: 1, title: 'Verify User Identity', description: 'Confirm user identity through security questions or manager approval', automatable: false },
                { id: 2, title: 'Check Account Status', description: 'Verify account is not locked or disabled', automatable: true },
                { id: 3, title: 'Reset Password', description: 'Generate temporary password and set "must change at next login"', automatable: true },
                { id: 4, title: 'Communicate to User', description: 'Securely provide temporary password to user', automatable: false },
                { id: 5, title: 'Document in Ticket', description: 'Record password reset in incident ticket', automatable: false }
            ]
        },
        {
            id: 'RB-003',
            title: 'Server High CPU Investigation',
            category: 'Infrastructure',
            description: 'Procedure to investigate and resolve high CPU utilization on servers',
            author: 'server.admin',
            lastUpdated: '2025-01-20',
            estimatedTime: '20-45 min',
            steps: [
                { id: 1, title: 'Confirm Alert', description: 'Verify CPU alert in monitoring system', automatable: true },
                { id: 2, title: 'Identify Top Processes', description: 'Run "Get-Process | Sort CPU -Desc | Select -First 10"', automatable: true },
                { id: 3, title: 'Check Recent Changes', description: 'Review change management for recent deployments', automatable: false },
                { id: 4, title: 'Check Scheduled Tasks', description: 'Review Task Scheduler for running jobs', automatable: true },
                { id: 5, title: 'Analyze Process', description: 'Determine if top process is expected behavior or anomaly', automatable: false },
                { id: 6, title: 'Take Action', description: 'Restart service, kill process, or escalate as needed', automatable: false },
                { id: 7, title: 'Monitor', description: 'Verify CPU returns to normal levels', automatable: true },
                { id: 8, title: 'Document', description: 'Record findings and resolution in ticket', automatable: false }
            ]
        },
        {
            id: 'RB-004',
            title: 'New Employee Workstation Setup',
            category: 'Hardware',
            description: 'Checklist for setting up a new employee workstation',
            author: 'hardware.support',
            lastUpdated: '2025-01-10',
            estimatedTime: '45-60 min',
            steps: [
                { id: 1, title: 'Unbox and Inspect', description: 'Unbox workstation and verify all components', automatable: false },
                { id: 2, title: 'Connect Hardware', description: 'Connect monitor, keyboard, mouse, network cable', automatable: false },
                { id: 3, title: 'Power On and BIOS Check', description: 'Verify BIOS settings and secure boot', automatable: false },
                { id: 4, title: 'Join Domain', description: 'Join computer to ACME domain', automatable: true },
                { id: 5, title: 'Install Software', description: 'Install standard software package via SCCM', automatable: true },
                { id: 6, title: 'Configure Email', description: 'Setup Outlook with user mailbox', automatable: true },
                { id: 7, title: 'Install Printers', description: 'Add network printers for user location', automatable: true },
                { id: 8, title: 'User Verification', description: 'Have user log in and verify everything works', automatable: false }
            ]
        }
    ],

    // Current execution state
    currentExecution: null,

    // Render runbooks list
    render() {
        return `
            <div class="page-header">
                <div class="page-title">📖 Runbooks</div>
                <div class="page-subtitle">Standard Operating Procedures</div>
            </div>
            <div class="toolbar">
                <div class="toolbar-search">
                    <input type="text" placeholder="Search runbooks..." id="runbook-search" style="width: 250px;" oninput="RunbooksModule.filter()">
                    <button class="btn btn-sm btn-secondary">🔍</button>
                </div>
                <div class="toolbar-group" style="margin-left: var(--spacing-lg);">
                    <select class="form-control" style="width: 150px; padding: 4px;" id="runbook-category" onchange="RunbooksModule.filter()">
                        <option value="">All Categories</option>
                        <option>Network</option>
                        <option>Identity</option>
                        <option>Infrastructure</option>
                        <option>Hardware</option>
                    </select>
                </div>
            </div>
            <div class="page-content" id="runbooks-content">
                ${this.renderRunbookCards(this.runbooks)}
            </div>
        `;
    },

    renderRunbookCards(runbooks) {
        if (runbooks.length === 0) {
            return '<div class="empty-state"><div class="empty-state-icon">📖</div><div class="empty-state-title">No runbooks found</div></div>';
        }

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: var(--spacing-md);">
                ${runbooks.map(rb => `
                    <div class="card">
                        <div class="card-header">
                            <span>${rb.id}</span>
                            <span class="badge badge-new">${rb.category}</span>
                        </div>
                        <div class="card-body">
                            <h4 style="margin-bottom: var(--spacing-sm);">${rb.title}</h4>
                            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: var(--spacing-sm);">
                                ${rb.description}
                            </p>
                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: var(--spacing-md);">
                                <span>📝 ${rb.steps.length} steps</span> ·
                                <span>⏱️ ${rb.estimatedTime}</span> ·
                                <span>👤 ${rb.author}</span>
                            </div>
                            <button class="btn btn-sm btn-primary" onclick="RunbooksModule.view('${rb.id}')">View Runbook</button>
                            <button class="btn btn-sm btn-success" onclick="RunbooksModule.startExecution('${rb.id}')">▶ Execute</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Filter runbooks
    filter() {
        const search = document.getElementById('runbook-search')?.value?.toLowerCase() || '';
        const category = document.getElementById('runbook-category')?.value || '';

        const filtered = this.runbooks.filter(rb => {
            const matchSearch = !search ||
                rb.title.toLowerCase().includes(search) ||
                rb.description.toLowerCase().includes(search) ||
                rb.id.toLowerCase().includes(search);
            const matchCategory = !category || rb.category === category;
            return matchSearch && matchCategory;
        });

        document.getElementById('runbooks-content').innerHTML = this.renderRunbookCards(filtered);
    },

    // View runbook details
    view(runbookId) {
        const rb = this.runbooks.find(r => r.id === runbookId);
        if (!rb) return;

        Modals.show(`
            <div class="modal-header">
                <span>📖 ${rb.id}: ${rb.title}</span>
                <button class="panel-close" onclick="Modals.close()">×</button>
            </div>
            <div class="modal-body" style="max-width: 700px; max-height: 70vh; overflow-y: auto;">
                <div style="margin-bottom: var(--spacing-md); padding-bottom: var(--spacing-md); border-bottom: 1px solid var(--border-light);">
                    <span class="badge badge-new">${rb.category}</span>
                    <span style="margin-left: var(--spacing-md); font-size: 11px; color: var(--text-muted);">
                        Last updated: ${rb.lastUpdated} · Author: ${rb.author} · Est. time: ${rb.estimatedTime}
                    </span>
                </div>
                <p style="margin-bottom: var(--spacing-lg);">${rb.description}</p>

                <h4 style="margin-bottom: var(--spacing-md);">Steps:</h4>
                ${rb.steps.map((step, idx) => `
                    <div class="card" style="margin-bottom: var(--spacing-sm);">
                        <div class="card-body" style="padding: var(--spacing-sm) var(--spacing-md);">
                            <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                                <span style="background: var(--accent-blue); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${step.id}</span>
                                <strong>${step.title}</strong>
                                ${step.automatable ? '<span class="badge badge-resolved" style="margin-left: auto;">Automatable</span>' : ''}
                            </div>
                            <p style="margin: var(--spacing-xs) 0 0 32px; font-size: 12px; color: var(--text-secondary);">${step.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="Modals.close()">Close</button>
                <button class="btn btn-success" onclick="Modals.close(); RunbooksModule.startExecution('${rb.id}')">▶ Execute Runbook</button>
            </div>
        `);
    },

    // Start runbook execution
    startExecution(runbookId) {
        const rb = this.runbooks.find(r => r.id === runbookId);
        if (!rb) return;

        this.currentExecution = {
            runbook: rb,
            currentStep: 0,
            startTime: new Date(),
            completedSteps: []
        };

        this.renderExecutionStep();
    },

    // Render current execution step
    renderExecutionStep() {
        if (!this.currentExecution) return;

        const { runbook, currentStep, completedSteps } = this.currentExecution;
        const step = runbook.steps[currentStep];
        const isLastStep = currentStep === runbook.steps.length - 1;
        const progress = Math.round((currentStep / runbook.steps.length) * 100);

        Modals.show(`
            <div class="modal-header">
                <span>▶ Executing: ${runbook.title}</span>
                <button class="panel-close" onclick="RunbooksModule.cancelExecution()">×</button>
            </div>
            <div class="modal-body" style="width: 600px;">
                <!-- Progress bar -->
                <div style="margin-bottom: var(--spacing-lg);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs); font-size: 11px;">
                        <span>Step ${currentStep + 1} of ${runbook.steps.length}</span>
                        <span>${progress}%</span>
                    </div>
                    <div style="background: var(--bg-secondary); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="background: var(--accent-blue); height: 100%; width: ${progress}%; transition: width 0.3s;"></div>
                    </div>
                </div>

                <!-- Current step -->
                <div class="card" style="border-color: var(--accent-blue);">
                    <div class="card-header" style="background: var(--accent-blue); color: white;">
                        Step ${step.id}: ${step.title}
                        ${step.automatable ? '<span class="badge" style="background: white; color: var(--accent-blue); margin-left: auto;">Automatable</span>' : ''}
                    </div>
                    <div class="card-body">
                        <p style="margin-bottom: var(--spacing-md);">${step.description}</p>

                        ${step.automatable ? `
                            <button class="btn btn-sm btn-success" onclick="RunbooksModule.runAutomation(${currentStep})">
                                🤖 Run Automation
                            </button>
                        ` : ''}

                        <div class="form-group" style="margin-top: var(--spacing-md);">
                            <label class="form-label">Notes (optional)</label>
                            <textarea class="form-control" id="step-notes" rows="2" placeholder="Add notes about this step..."></textarea>
                        </div>
                    </div>
                </div>

                <!-- Completed steps summary -->
                ${completedSteps.length > 0 ? `
                    <div style="margin-top: var(--spacing-md);">
                        <h5 style="margin-bottom: var(--spacing-sm);">Completed Steps:</h5>
                        <div style="font-size: 11px; color: var(--text-muted);">
                            ${completedSteps.map(s => `✅ Step ${s.id}: ${s.title}`).join('<br>')}
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="RunbooksModule.cancelExecution()">Cancel</button>
                ${currentStep > 0 ? `<button class="btn btn-secondary" onclick="RunbooksModule.previousStep()">← Previous</button>` : ''}
                <button class="btn btn-primary" onclick="RunbooksModule.completeStep()">
                    ${isLastStep ? '✓ Complete Runbook' : 'Mark Complete & Next →'}
                </button>
            </div>
        `);
    },

    // Complete current step
    completeStep() {
        if (!this.currentExecution) return;

        const { runbook, currentStep } = this.currentExecution;
        const step = runbook.steps[currentStep];
        const notes = document.getElementById('step-notes')?.value || '';

        this.currentExecution.completedSteps.push({
            ...step,
            completedAt: new Date(),
            notes: notes
        });

        if (currentStep < runbook.steps.length - 1) {
            this.currentExecution.currentStep++;
            this.renderExecutionStep();
        } else {
            this.finishExecution();
        }
    },

    // Previous step
    previousStep() {
        if (!this.currentExecution || this.currentExecution.currentStep === 0) return;
        this.currentExecution.currentStep--;
        this.currentExecution.completedSteps.pop();
        this.renderExecutionStep();
    },

    // Simulated automation outputs for different step types
    automationOutputs: {
        'Check Network Connectivity': {
            command: 'ping vpn.acme.com -n 4',
            output: `Pinging vpn.acme.com [10.0.0.1] with 32 bytes of data:
Reply from 10.0.0.1: bytes=32 time=12ms TTL=64
Reply from 10.0.0.1: bytes=32 time=11ms TTL=64
Reply from 10.0.0.1: bytes=32 time=13ms TTL=64
Reply from 10.0.0.1: bytes=32 time=11ms TTL=64

Ping statistics for 10.0.0.1:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`,
            status: 'success',
            duration: '2.3s'
        },
        'Clear VPN Cache': {
            command: 'Clear-VPNCache -Force',
            output: `[INFO] Stopping VPN client service...
[INFO] Service stopped.
[INFO] Clearing certificate cache at C:\\Users\\*\\AppData\\Local\\VPN\\Cache
[INFO] Deleted 12 cached certificates
[INFO] Clearing connection profiles...
[INFO] Removed 3 stale profiles
[INFO] Restarting VPN client service...
[SUCCESS] VPN cache cleared successfully`,
            status: 'success',
            duration: '4.7s'
        },
        'Check Certificate': {
            command: 'Get-VPNCertificate -Verify',
            output: `Certificate Details:
  Subject: CN=user@acme.com
  Issuer: CN=ACME Corporate CA
  Valid From: 2024-06-15
  Valid To: 2025-06-15
  Status: VALID
  Thumbprint: A1B2C3D4E5F6...`,
            status: 'success',
            duration: '1.2s'
        },
        'Restart VPN Service': {
            command: 'Restart-Service -Name "VPNClient"',
            output: `[INFO] Stopping VPN Client Service...
[INFO] Service stopped successfully.
[INFO] Starting VPN Client Service...
[SUCCESS] Service started successfully.
[INFO] Service Status: Running`,
            status: 'success',
            duration: '3.8s'
        },
        'Check Account Status': {
            command: 'Get-ADUser -Identity $username -Properties *',
            output: `UserPrincipalName : john.smith@acme.com
Enabled           : True
LockedOut         : False
PasswordExpired   : False
PasswordLastSet   : 2025-01-15 09:23:41
LastLogonDate     : 2025-02-16 08:45:12
AccountExpires    : Never

[SUCCESS] Account is active and in good standing`,
            status: 'success',
            duration: '0.8s'
        },
        'Reset Password': {
            command: 'Set-ADAccountPassword -Reset -NewPassword $tempPassword',
            output: `[INFO] Generating secure temporary password...
[INFO] Password complexity: STRONG (16 chars, mixed case, numbers, symbols)
[INFO] Applying password to account...
[INFO] Setting "User must change password at next logon" flag...
[SUCCESS] Password reset completed

Temporary Password: Tmp#2025$Acme
(Password will expire in 24 hours if not changed)`,
            status: 'success',
            duration: '1.5s'
        },
        'Confirm Alert': {
            command: 'Get-MonitoringAlert -Server $serverName -Type CPU',
            output: `Alert ID: ALT-2025-0892
Server: PROD-APP-01
Alert Type: High CPU Utilization
Threshold: 90%
Current Value: 94.2%
Duration: 15 minutes
First Detected: 2025-02-16 10:23:45
Status: ACTIVE

[WARNING] CPU utilization is above critical threshold`,
            status: 'warning',
            duration: '0.6s'
        },
        'Identify Top Processes': {
            command: 'Get-Process | Sort CPU -Desc | Select -First 10',
            output: `NPM(K)  PM(M)   WS(M)   CPU(s)    Id  ProcessName
------  -----   -----   ------    --  -----------
   892  4,521   3,842   847.23  1234  sqlservr
   234    892     756   423.11  2345  w3wp
   156    445     398   156.78  3456  java
   123    234     189    89.45  4567  node
    89    156     134    45.23  5678  explorer
    67    123     112    23.45  6789  chrome
    45     89      78    12.34  7890  Teams
    34     67      56     8.91  8901  outlook
    23     45      34     4.56  9012  notepad
    12     23      12     2.34  0123  svchost

[INFO] Top consumer: SQL Server (847.23s CPU time)`,
            status: 'success',
            duration: '1.1s'
        },
        'Check Scheduled Tasks': {
            command: 'Get-ScheduledTask | Where State -eq "Running"',
            output: `TaskName                    State     LastRunTime          NextRunTime
--------                    -----     -----------          -----------
BackupDatabase              Running   2025-02-16 10:00:00  2025-02-16 11:00:00
SyncActiveDirectory         Running   2025-02-16 10:15:00  2025-02-16 10:30:00
UpdateInventory             Running   2025-02-16 10:20:00  2025-02-16 10:25:00

[INFO] 3 scheduled tasks currently running`,
            status: 'success',
            duration: '0.9s'
        },
        'Monitor': {
            command: 'Get-Counter "\\Processor(_Total)\\% Processor Time" -SampleInterval 2 -MaxSamples 5',
            output: `Timestamp                  CPUUsage
---------                  --------
2025-02-16 10:30:01        72.3%
2025-02-16 10:30:03        68.7%
2025-02-16 10:30:05        54.2%
2025-02-16 10:30:07        42.8%
2025-02-16 10:30:09        38.1%

[SUCCESS] CPU utilization returning to normal levels
Average: 55.2% (down from 94.2%)`,
            status: 'success',
            duration: '10.2s'
        },
        'Join Domain': {
            command: 'Add-Computer -DomainName "acme.local" -Credential $domainCred',
            output: `[INFO] Contacting domain controller DC01.acme.local...
[INFO] Verifying credentials...
[INFO] Creating computer account in OU=Workstations,DC=acme,DC=local
[INFO] Joining computer to domain...
[SUCCESS] Computer successfully joined to ACME.LOCAL domain

Note: Restart required to complete domain join`,
            status: 'success',
            duration: '8.4s'
        },
        'Install Software': {
            command: 'Install-SCCMPackage -PackageName "StandardDesktop" -Force',
            output: `[INFO] Connecting to SCCM Distribution Point...
[INFO] Downloading package manifest...
[INFO] Package size: 2.4 GB

Installing applications:
  [✓] Microsoft Office 365 ProPlus
  [✓] Adobe Acrobat Reader DC
  [✓] 7-Zip
  [✓] Google Chrome Enterprise
  [✓] Cisco AnyConnect VPN
  [✓] Microsoft Teams
  [✓] Company Security Agent

[SUCCESS] All 7 applications installed successfully
Total install time: 12 minutes 34 seconds`,
            status: 'success',
            duration: '12m 34s'
        },
        'Configure Email': {
            command: 'New-OutlookProfile -UserEmail $userEmail -AutoDiscover',
            output: `[INFO] Running Autodiscover for john.smith@acme.com...
[INFO] Found Exchange Server: mail.acme.com
[INFO] Configuring Outlook profile...
[INFO] Setting up mailbox connection...
[INFO] Synchronizing mailbox...
[SUCCESS] Outlook configured successfully

Mailbox: john.smith@acme.com
Server: mail.acme.com
Mode: Cached Exchange Mode
Initial sync: 127 items`,
            status: 'success',
            duration: '45.3s'
        },
        'Install Printers': {
            command: 'Add-Printer -ConnectionName "\\\\printserver\\Floor2-HP"',
            output: `[INFO] Connecting to print server...
[INFO] Installing printer driver...
[INFO] Adding printer connections...

Printers installed:
  [✓] Floor2-HP-Color (Color LaserJet)
  [✓] Floor2-HP-BW (LaserJet Pro)
  [✓] Reception-Copier (Xerox WorkCentre)

[SUCCESS] 3 printers installed and ready`,
            status: 'success',
            duration: '6.7s'
        }
    },

    // Run automation for step - enhanced with detailed modal
    runAutomation(stepIndex) {
        if (!this.currentExecution) return;

        const step = this.currentExecution.runbook.steps[stepIndex];
        const automationData = this.automationOutputs[step.title] || {
            command: `Execute-Automation -Step "${step.title}"`,
            output: `[INFO] Initializing automation for: ${step.title}\n[INFO] Running pre-checks...\n[INFO] Executing automation script...\n[SUCCESS] Automation completed successfully`,
            status: 'success',
            duration: '2.1s'
        };

        // Show automation modal
        const modalContent = `
            <div class="modal-header" style="background: linear-gradient(180deg, #2a5298 0%, #1e3c72 100%);">
                <span>🤖 Running Automation: ${step.title}</span>
                <button class="panel-close" onclick="Modals.close(); RunbooksModule.renderExecutionStep();">×</button>
            </div>
            <div class="modal-body" style="width: 650px; max-height: 70vh; overflow-y: auto;">
                <!-- Automation Info -->
                <div style="margin-bottom: var(--spacing-md); padding: var(--spacing-md); background: var(--bg-secondary); border-radius: 4px;">
                    <div style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-sm);">
                        <span style="font-size: 20px;">⚡</span>
                        <strong>Automation Details</strong>
                    </div>
                    <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: var(--spacing-sm);">${step.description}</p>
                </div>

                <!-- Command being executed -->
                <div style="margin-bottom: var(--spacing-md);">
                    <label class="form-label" style="display: flex; align-items: center; gap: var(--spacing-xs);">
                        <span>📋</span> Command
                    </label>
                    <div style="background: #1e1e1e; color: #d4d4d4; padding: var(--spacing-md); border-radius: 4px; font-family: var(--font-mono); font-size: 11px; overflow-x: auto;">
                        <span style="color: #569cd6;">PS&gt;</span> ${automationData.command}
                    </div>
                </div>

                <!-- Progress/Status -->
                <div id="automation-progress" style="margin-bottom: var(--spacing-md);">
                    <div style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-sm);">
                        <div class="automation-spinner" style="width: 16px; height: 16px; border: 2px solid var(--border-light); border-top-color: var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <span style="color: var(--accent-blue); font-weight: 500;">Executing automation...</span>
                    </div>
                    <div style="background: var(--bg-secondary); height: 4px; border-radius: 2px; overflow: hidden;">
                        <div id="automation-progress-bar" style="background: var(--accent-blue); height: 100%; width: 0%; transition: width 0.3s;"></div>
                    </div>
                </div>

                <!-- Output Console -->
                <div style="margin-bottom: var(--spacing-md);">
                    <label class="form-label" style="display: flex; align-items: center; gap: var(--spacing-xs);">
                        <span>💻</span> Output Console
                    </label>
                    <div id="automation-output" style="background: #1e1e1e; color: #d4d4d4; padding: var(--spacing-md); border-radius: 4px; font-family: var(--font-mono); font-size: 11px; min-height: 150px; max-height: 250px; overflow-y: auto; white-space: pre-wrap;">
                        <span style="color: #608b4e;">// Waiting for output...</span>
                    </div>
                </div>

                <!-- Notes input -->
                <div class="form-group">
                    <label class="form-label" style="display: flex; align-items: center; gap: var(--spacing-xs);">
                        <span>📝</span> Automation Notes (optional)
                    </label>
                    <textarea class="form-control" id="automation-notes" rows="2" placeholder="Add notes about this automation run (observations, issues, etc.)..."></textarea>
                </div>
            </div>
            <div class="modal-footer" id="automation-footer">
                <button class="btn btn-secondary" onclick="Modals.close(); RunbooksModule.renderExecutionStep();" disabled id="automation-close-btn">Close</button>
            </div>
        `;

        Modals.show(modalContent);

        // Add spin animation style if not exists
        if (!document.getElementById('automation-styles')) {
            const style = document.createElement('style');
            style.id = 'automation-styles';
            style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }

        // Simulate automation execution with progress
        this.simulateAutomationExecution(automationData, stepIndex);
    },

    // Simulate automation execution with realistic progress
    simulateAutomationExecution(automationData, stepIndex) {
        const outputEl = document.getElementById('automation-output');
        const progressBar = document.getElementById('automation-progress-bar');
        const progressDiv = document.getElementById('automation-progress');
        const closeBtn = document.getElementById('automation-close-btn');
        const footerEl = document.getElementById('automation-footer');

        const outputLines = automationData.output.split('\n');
        let currentLine = 0;
        let progress = 0;

        // Clear initial output
        outputEl.innerHTML = '';

        // Simulate line-by-line output
        const outputInterval = setInterval(() => {
            if (currentLine < outputLines.length) {
                const line = outputLines[currentLine];
                let coloredLine = line;

                // Color code output lines
                if (line.includes('[SUCCESS]') || line.includes('✓')) {
                    coloredLine = `<span style="color: #4ec9b0;">${line}</span>`;
                } else if (line.includes('[WARNING]')) {
                    coloredLine = `<span style="color: #dcdcaa;">${line}</span>`;
                } else if (line.includes('[ERROR]')) {
                    coloredLine = `<span style="color: #f14c4c;">${line}</span>`;
                } else if (line.includes('[INFO]')) {
                    coloredLine = `<span style="color: #9cdcfe;">${line}</span>`;
                } else if (line.includes(':')) {
                    coloredLine = `<span style="color: #ce9178;">${line}</span>`;
                }

                outputEl.innerHTML += coloredLine + '\n';
                outputEl.scrollTop = outputEl.scrollHeight;
                currentLine++;

                // Update progress
                progress = Math.round((currentLine / outputLines.length) * 100);
                progressBar.style.width = progress + '%';
            } else {
                clearInterval(outputInterval);

                // Show completion status
                const statusColor = automationData.status === 'success' ? 'var(--accent-green)' :
                                   automationData.status === 'warning' ? 'var(--accent-orange)' : 'var(--accent-red)';
                const statusIcon = automationData.status === 'success' ? '✅' :
                                  automationData.status === 'warning' ? '⚠️' : '❌';

                progressDiv.innerHTML = `
                    <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                        <span style="font-size: 16px;">${statusIcon}</span>
                        <span style="color: ${statusColor}; font-weight: 500;">Automation ${automationData.status === 'success' ? 'completed successfully' : automationData.status === 'warning' ? 'completed with warnings' : 'failed'}</span>
                        <span style="margin-left: auto; font-size: 11px; color: var(--text-muted);">Duration: ${automationData.duration}</span>
                    </div>
                `;

                // Enable close button and add "Apply Results" button
                closeBtn.disabled = false;
                footerEl.innerHTML = `
                    <button class="btn btn-secondary" onclick="Modals.close(); RunbooksModule.renderExecutionStep();">Close</button>
                    <button class="btn btn-success" onclick="RunbooksModule.applyAutomationResults(${stepIndex});">
                        ✓ Apply Results & Continue
                    </button>
                `;
            }
        }, 100); // Output a line every 100ms for realistic effect
    },

    // Apply automation results and return to execution
    applyAutomationResults(stepIndex) {
        const notes = document.getElementById('automation-notes')?.value || '';

        // Store the notes to apply after re-render
        this.pendingAutomationNotes = notes ? `[Automation executed] ${notes}` : '[Automation executed successfully]';

        // Directly render the execution step (replaces modal content smoothly)
        this.renderExecutionStep();

        // Apply notes after render
        requestAnimationFrame(() => {
            const stepNotesEl = document.getElementById('step-notes');
            if (stepNotesEl && this.pendingAutomationNotes) {
                stepNotesEl.value = this.pendingAutomationNotes;
                this.pendingAutomationNotes = null;
            }
        });

        Toast.show('Automation results applied', 'success');
    },

    // Finish execution
    finishExecution() {
        if (!this.currentExecution) return;

        const { runbook, startTime, completedSteps } = this.currentExecution;
        const endTime = new Date();
        const duration = Math.round((endTime - startTime) / 60000); // minutes

        Utils.addAuditLog(
            ITSMData.currentUser.username,
            'Runbook Executed',
            runbook.id,
            `Completed ${runbook.title} in ${duration} minutes`
        );

        Modals.show(`
            <div class="modal-header">
                <span>✅ Runbook Completed</span>
                <button class="panel-close" onclick="Modals.close()">×</button>
            </div>
            <div class="modal-body" style="text-align: center; padding: var(--spacing-xl);">
                <div style="font-size: 48px; margin-bottom: var(--spacing-md);">✅</div>
                <h3>Runbook Executed Successfully</h3>
                <p style="color: var(--text-muted); margin: var(--spacing-md) 0;">
                    <strong>${runbook.title}</strong><br>
                    Completed ${completedSteps.length} steps in ${duration} minutes
                </p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="Modals.close()">Done</button>
            </div>
        `);

        this.currentExecution = null;
    },

    // Cancel execution
    cancelExecution() {
        if (this.currentExecution) {
            Modals.confirm(
                'Cancel Execution',
                'Are you sure you want to cancel this runbook execution?',
                () => {
                    this.currentExecution = null;
                    Toast.show('Runbook execution cancelled', 'warning');
                },
                'Yes, Cancel',
                'btn-danger'
            );
        } else {
            Modals.close();
        }
    }
};

window.RunbooksModule = RunbooksModule;
