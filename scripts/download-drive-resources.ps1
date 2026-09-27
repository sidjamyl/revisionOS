# The academic PDFs stay local and are excluded from Git. Run with PowerShell
# after the owner has enabled link-based reader access to the shared Drive folder.
$ErrorActionPreference = 'Stop'
$destination = Join-Path (Get-Location) '.data\imports'
New-Item -ItemType Directory -Force -Path $destination | Out-Null

$resources = @(
  @{ Name = 'esi-alg1-course-logic.pdf'; Id = '1Dv8kB_DWCLP7erjAsqar1VeolEwMW1mG' },
  @{ Name = 'esi-alg1-course-structures.pdf'; Id = '1ehBSt9A6Z1q8NWoApPCvCg8uow0Sl0q1' },
  @{ Name = 'esi-alg1-course-polynomials.pdf'; Id = '1HWC4MenipqAR__JrMd_lIP_BksD0Imyk' },
  @{ Name = 'esi-alg1-td-logic.pdf'; Id = '1_vDWyRWrc2a_M-mr6BBvNDZwEtk4aUlv' },
  @{ Name = 'esi-alg1-td-structures.pdf'; Id = '1jdmkumEcx2XziTwSNMx6pf54SnVxUB7d' },
  @{ Name = 'esi-alg1-td-polynomials.pdf'; Id = '1mlxRqIOR7UsOpGK2-6hT7risboxsT6JV' },
  @{ Name = 'esi-alg1-exam-2016.pdf'; Id = '1J4azER4mBSFzbxyen8IrkS0uhFsnW949' },
  @{ Name = 'esi-alg1-exam-2017.pdf'; Id = '19tu0git3Df5gDcly55U6eA7B5v7v3q8l' },
  @{ Name = 'esi-alg1-exam-2018.pdf'; Id = '1zEAdAeDOgt9vHp3bPvfQl-rT4PjchNxP' },
  @{ Name = 'esi-alg1-exam-2019.pdf'; Id = '1bMR077GczkBvPgvldU53Kbedf9nYg2tz' },
  @{ Name = 'esi-alg1-exam-2020.pdf'; Id = '12oU4lZdBenS0UHIO_z_WmC-DxyxCYGu1' },
  @{ Name = 'esi-alg1-exam-2021.pdf'; Id = '14AGN9mtCHHRPfFUZyMMr_kgY37o_k4AE' },
  @{ Name = 'esi-alg1-exam-2022.pdf'; Id = '1euVdz5WoVw6g_RO_1OF-Yu_Xmv38_1Bi' },
  @{ Name = 'esi-alg1-exam-2023.pdf'; Id = '1dUqb-3-Z2QsFL9XXSbT4NU5Rg0GLn2Rq' },
  @{ Name = 'esi-alg1-exam-2024.pdf'; Id = '1074DkwVsUlKtjVxfxSsBAwDCvmyLjKC2' },
  @{ Name = 'esi-alg1-exam-2025.pdf'; Id = '1vpXGUC04IhStHMhNJJHUBhAg7-2pifaF' },
  @{ Name = 'esi-igl-course-01-methodologies.pdf'; Id = '1DJCdMoFEHmb1qg-EX6IM8W5q9cXlClql' },
  @{ Name = 'esi-igl-course-02-modeling.pdf'; Id = '1r5LSQEK9jjnqsGE5X0JGklvBTh6fGhTh' },
  @{ Name = 'esi-igl-course-03-requirements.pdf'; Id = '1QSSRc9hLTpYUqm2MY9z6Af2qVdAfb5NG' },
  @{ Name = 'esi-igl-course-04-analysis.pdf'; Id = '1Z2sZWkmVQC8wKF7UP1McySRP2YMHnc0C' },
  @{ Name = 'esi-igl-course-05-architecture.pdf'; Id = '1mOSwmG7Rpnj35RTmencJClLgUMVUEj9_' },
  @{ Name = 'esi-igl-course-06-design.pdf'; Id = '1CA4-Yt3EFevgKprlTj83LBLREblqSFBN' },
  @{ Name = 'esi-igl-course-07-testing.pdf'; Id = '1izc2ES6lsOAF1oGSozpMCYh4r1NvPeYW' },
  @{ Name = 'esi-igl-td-01.pdf'; Id = '1M9Rgv5dGbbfCvIgFuJkXDZQ3SrFEWvRB' },
  @{ Name = 'esi-igl-td-02.pdf'; Id = '1pSIdqpyXj33uBwWjTGtuVjEXsFZtFb0r' },
  @{ Name = 'esi-igl-td-03.pdf'; Id = '1v2B1hDyXjg7kRxbFddJ5xe__1CSwSX2F' },
  @{ Name = 'esi-igl-exam-2016.pdf'; Id = '1m_UrvOOivy8W-dx_lNoW9Mw8iDuLrZYX' },
  @{ Name = 'esi-igl-exam-2017.pdf'; Id = '1FQ9GY1zV9-ir6wfrL362oHSNCm9INb5w' },
  @{ Name = 'esi-igl-exam-2018.pdf'; Id = '1mi8V_p8SSBEtoihgYTyekULWXRVoHQ3N' },
  @{ Name = 'esi-igl-exam-2020.pdf'; Id = '1WZeF4gc7K7WI7r_E8-xliDui-bwcDpod' },
  @{ Name = 'esi-igl-exam-2021.pdf'; Id = '1irL_nHy6YGRfpqQ1nhAvLRV1p9ZEmdH8' },
  @{ Name = 'esi-igl-exam-2023.pdf'; Id = '1840W9rsseJPHiSgtPNCYn4j4nik7QTA6' },
  @{ Name = 'esi-igl-exam-2024.pdf'; Id = '1YVkFlCva8Dv2_5wb--AnlvFgKXJ_bJdH' },
  @{ Name = 'esi-igl-exam-2025.pdf'; Id = '14pm2hqwJ7IY-rhPsMlRX74yVhSKUHjgc' },
  @{ Name = 'esi-igl-exam-2026.pdf'; Id = '1ls4I10grMkgtA_kdrf9NeRm377MwwdiT' }
)

$failures = @()
foreach ($resource in $resources) {
  $path = Join-Path $destination $resource.Name
  if (Test-Path -LiteralPath $path) { Write-Host "Already present: $($resource.Name)"; continue }
  try {
    Invoke-WebRequest -Uri "https://drive.google.com/uc?export=download&id=$($resource.Id)" -OutFile $path
    $header = [System.Text.Encoding]::ASCII.GetString([System.IO.File]::ReadAllBytes($path), 0, 5)
    if ($header -ne '%PDF-') { Remove-Item -LiteralPath $path; throw 'Not a PDF response' }
    Write-Host "Downloaded: $($resource.Name)"
  } catch {
    $failures += "$($resource.Name): $_"
  }
}
if ($failures.Count) { throw ($failures -join "`n") }
