param(
  [Parameter(Mandatory=$true)][string]$InputPath,
  [Parameter(Mandatory=$true)][string]$OutputPath,
  [Parameter(Mandatory=$false)][string]$Format = "docx"
)

$ErrorActionPreference = "Stop"

function Convert-Word {
  param([string]$in, [string]$out)
  $word = $null
  try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open($in, $false, $true)
    # 17 = wdExportFormatPDF
    $doc.ExportAsFixedFormat($out, 17, $false, 0, 0, 1, 1, 0, $true, $true, 0, $true, $true, $false)
    $doc.Close($false)
    Write-Output "SUCCESS"
  } finally {
    if ($word -ne $null) {
      $word.Quit()
      [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
    }
  }
}

function Convert-PowerPoint {
  param([string]$in, [string]$out)
  $ppt = $null
  try {
    $ppt = New-Object -ComObject PowerPoint.Application
    # 1 = msoTrue (ReadOnly), 0 = msoFalse (Untitled), 0 = msoFalse (WithWindow)
    $pres = $ppt.Presentations.Open($in, 1, 0, 0)
    # 32 = ppSaveAsPDF
    $pres.SaveAs($out, 32)
    $pres.Close()
    Write-Output "SUCCESS"
  } finally {
    if ($ppt -ne $null) {
      $ppt.Quit()
      [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
    }
  }
}

function Convert-Excel {
  param([string]$in, [string]$out)
  $xl = $null
  try {
    $xl = New-Object -ComObject Excel.Application
    $xl.Visible = $false
    $xl.DisplayAlerts = $false
    $wb = $xl.Workbooks.Open($in, $false, $true)
    # 0 = xlTypePDF
    $wb.ExportAsFixedFormat(0, $out)
    $wb.Close($false)
    Write-Output "SUCCESS"
  } finally {
    if ($xl -ne $null) {
      $xl.Quit()
      [System.Runtime.InteropServices.Marshal]::ReleaseComObject($xl) | Out-Null
    }
  }
}

try {
  if (-not (Test-Path -Path $InputPath)) {
    throw "Input file does not exist: $InputPath"
  }

  $ext = [System.IO.Path]::GetExtension($InputPath).ToLower().TrimStart('.')
  if ($Format) {
    $ext = $Format.ToLower().TrimStart('.')
  }

  if ($ext -in @("doc", "docx")) {
    Convert-Word -in $InputPath -out $OutputPath
  } elseif ($ext -in @("ppt", "pptx")) {
    Convert-PowerPoint -in $InputPath -out $OutputPath
  } elseif ($ext -in @("xls", "xlsx", "csv")) {
    Convert-Excel -in $InputPath -out $OutputPath
  } else {
    throw "Unsupported format: $ext"
  }
} catch {
  Write-Error $_
  exit 1
}
