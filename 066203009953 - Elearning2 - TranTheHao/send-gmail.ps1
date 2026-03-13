param(
    [Parameter(Mandatory = $true)]
    [string]$SenderEmail,

    [Parameter(Mandatory = $true)]
    [string]$AppPassword,

    [Parameter(Mandatory = $true)]
    [string]$ToEmail,

    [string]$ToName = "tranthehao",
    [string]$Subject = "SMTP Gmail Test",
    [string]$Body = "Hello from Gmail SMTP app password test."
)

$ErrorActionPreference = 'Stop'

# Gmail SMTP settings
$smtpHost = "smtp.gmail.com"
$smtpPort = 587

$securePass = ConvertTo-SecureString $AppPassword -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($SenderEmail, $securePass)

try {
    $mail = New-Object System.Net.Mail.MailMessage
    $mail.From = $SenderEmail
    $mail.To.Add($ToEmail)
    $mail.Subject = $Subject
    $mail.Body = "Hello $ToName,`n$Body"

    $smtp = New-Object System.Net.Mail.SmtpClient($smtpHost, $smtpPort)
    $smtp.EnableSsl = $true
    $smtp.Credentials = $credential
    $smtp.Timeout = 30000

    $smtp.Send($mail)

    Write-Output "SENT_OK"
    Write-Output "From: $SenderEmail"
    Write-Output "To: $ToEmail"
    Write-Output "Host: ${smtpHost}:$smtpPort (TLS)"
}
catch {
    Write-Output "SEND_FAILED"
    Write-Output $_.Exception.Message
    exit 1
}
