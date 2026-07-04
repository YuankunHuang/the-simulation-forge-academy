@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ============================================
echo   仿真铸造学院 - 一键部署到 Git
echo ============================================
echo.

where git >nul 2>nul
if errorlevel 1 (
    echo [失败] 未检测到 git，请先安装 Git 并加入 PATH。
    pause
    exit /b 1
)

echo [1/6] 检查 Git 仓库状态...
git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
    echo [失败] 当前目录不是一个 Git 仓库。
    pause
    exit /b 1
)

for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%b
echo       当前分支：!BRANCH!
echo.

set CHANGES=
for /f "delims=" %%i in ('git status --porcelain') do set CHANGES=1

if not defined CHANGES (
    echo 没有检测到任何未提交的改动，直接检查是否有待推送的提交...
    goto push_only
)

if not exist node_modules (
    echo [2/6] 未检测到 node_modules，正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo.
        echo [失败] 依赖安装失败，已中止部署。
        pause
        exit /b 1
    )
)

echo [2/6] 检测到改动，正在运行构建与测试作为部署前的安全检查...
call npm run build
if errorlevel 1 (
    echo.
    echo [失败] 构建失败，已中止部署，请先修复错误。
    pause
    exit /b 1
)
call npm test
if errorlevel 1 (
    echo.
    echo [失败] 测试未通过，已中止部署，请先修复错误。
    pause
    exit /b 1
)

echo.
echo [3/6] 添加全部改动到暂存区...
git add -A

echo.
set COMMIT_MSG=
set /p COMMIT_MSG=请输入提交说明（留空则使用默认时间戳信息）：
if "!COMMIT_MSG!"=="" (
    for /f "delims=" %%t in ('powershell -NoProfile -Command "Get-Date -Format \"yyyy-MM-dd HH:mm\""') do set NOW=%%t
    set COMMIT_MSG=chore: update !NOW!
)

echo.
echo [4/6] 提交改动：!COMMIT_MSG!
git commit -m "!COMMIT_MSG!"
if errorlevel 1 (
    echo.
    echo [失败] 提交失败，请查看上方信息。
    pause
    exit /b 1
)

:push_only
echo.
echo [5/6] 推送到远程 origin/!BRANCH! ...
git push origin !BRANCH!
if errorlevel 1 (
    echo.
    echo [失败] 推送失败。常见原因：远程有新提交（先手动 git pull）或没有推送权限。
    pause
    exit /b 1
)

echo.
echo [6/6] 部署完成！代码已推送到 origin/!BRANCH!。
echo.
pause
endlocal
