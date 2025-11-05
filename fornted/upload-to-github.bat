@echo off
echo ==========================================
echo Uploading to GitHub
echo ==========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    echo After installing, restart this script.
    pause
    exit /b 1
)

echo Git is installed. Continuing...
echo.

REM Initialize git if not already done
if not exist .git (
    echo Initializing git repository...
    git init
    echo.
)

REM Add all files
echo Adding all files to git...
git add .
echo.

REM Create commit
echo Creating commit...
git commit -m "Initial commit: Study Goal Tracker frontend"
echo.

REM Ask for GitHub repository URL
echo ==========================================
echo GitHub Repository Setup
echo ==========================================
echo.
echo Please provide your GitHub repository URL.
echo Example: https://github.com/yourusername/your-repo-name.git
echo.
set /p REPO_URL="Enter GitHub repository URL (or press Enter to skip): "

if "%REO_URL%"=="" (
    echo.
    echo Skipping remote setup.
    echo You can add the remote later using:
    echo   git remote add origin YOUR_REPO_URL
    echo   git branch -M main
    echo   git push -u origin main
) else (
    echo.
    echo Adding remote repository...
    git remote remove origin 2>nul
    git remote add origin %REPO_URL%
    echo.
    echo Setting branch to main...
    git branch -M main
    echo.
    echo Pushing to GitHub...
    git push -u origin main
    echo.
    echo Done! Your files have been uploaded to GitHub.
)

echo.
pause

