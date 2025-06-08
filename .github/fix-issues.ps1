# Set repo and project/milestone
$repo = "DigitalHerencia/FleetFusion"
$project = "@DigitalHerencia's Fleet Fusion"
$milestone = "Q3 2025 Release"

# Get all open issues as JSON
$issues = gh issue list -R $repo --state open --json number,title,labels

foreach ($issue in $issues | ConvertFrom-Json) {
    $number = $issue.number
    $title = $issue.title
    $labels = $issue.labels | ForEach-Object { $_.name }

    # Detect type and set label/prefix
    if ($labels -contains "Bug" -or $title -match "bug|fix|error|fail") {
        $type = "Bug"
        $prefix = "[Bug]: "
    } elseif ($labels -contains "Feature" -or $title -match "feature|enhancement|add") {
        $type = "Feature"
        $prefix = "[Feature]: "
    } elseif ($labels -contains "Docs" -or $title -match "doc|documentation|readme") {
        $type = "Docs"
        $prefix = "[Docs]: "
    } else {
        # Default to Feature if unclear
        $type = "Feature"
        $prefix = "[Feature]: "
    }

    # Fix the title if it doesn't have the prefix
    if (-not ($title -like "$prefix*")) {
        $newTitle = "$prefix$title"
        gh issue edit $number -R $repo --title "$newTitle"
        Write-Host "Updated title for issue #$number"
    }

    # Add core label if missing
    if (-not ($labels -contains $type)) {
        gh issue edit $number -R $repo --add-label $type
        Write-Host "Added label '$type' to issue #$number"
    }

    # Assign to project if not assigned
    # (gh does not let you check assignment easily; just try)
    gh issue edit $number -R $repo --project "$project"
    Write-Host "Assigned issue #$number to project"

    # Set milestone
    gh issue edit $number -R $repo --milestone "$milestone"
    Write-Host "Assigned milestone '$milestone' to issue #$number"
}