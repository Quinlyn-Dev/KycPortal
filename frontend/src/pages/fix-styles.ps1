$content = Get-Content "CustomerDetailPage.tsx" -Raw

# Replace label styles
$labelPattern = @'
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var\(--text-secondary\)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'block',
                  marginBottom: '0.5rem'
'@

$content = $content -replace [regex]::Escape($labelPattern), 'LABELSTYLE'
$content = $content -replace 'style=\{\{([^}]*)LABELSTYLE([^}]*)\}\}', 'style={labelStyle}'

# Replace value styles  
$valuePattern = @'
                  padding: '0.875rem 1rem',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid var\(--border\)',
                  fontSize: '0.9375rem',
                  color: 'var\(--text-primary\)'
'@

$content = $content -replace [regex]::Escape($valuePattern), 'VALUESTYLE'
$content = $content -replace 'style=\{\{([^}]*)VALUESTYLE([^}]*)\}\}', 'style={valueStyle}'

Set-Content "CustomerDetailPage.tsx" -Value $content
Write-Host "Done!"
