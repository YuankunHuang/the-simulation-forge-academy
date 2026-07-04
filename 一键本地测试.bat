@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ============================================
echo   仿真铸造学院 - 一键本地测试
echo ============================================
echo.

if not exist node_modules (
    echo [1/4] 未检测到 node_modules，正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo.
        echo [失败] 依赖安装失败，请检查网络或 Node.js 环境。
        pause
        exit /b 1
    )
) else (
    echo [1/4] 已检测到 node_modules，跳过安装。
)

echo.
echo [2/4] 正在进行类型检查与构建（tsc + vite build）...
call npm run build
if errorlevel 1 (
    echo.
    echo [失败] 构建失败，请查看上方错误信息。
    pause
    exit /b 1
)

echo.
echo [3/4] 正在运行单元测试（Vitest）...
call npm test
if errorlevel 1 (
    echo.
    echo [失败] 测试未通过，请查看上方错误信息。
    pause
    exit /b 1
)

echo.
echo [4/4] 全部通过！构建与测试均成功。
echo.

choice /C YN /M "是否启动本地开发服务器进行手动体验？(Y/N)"
if errorlevel 2 goto end
if errorlevel 1 (
    echo.
    echo 正在启动开发服务器... 打开浏览器访问终端里显示的 Local 地址，按 Ctrl+C 可停止。
    call npm run dev
)

:end
echo.
echo 测试完成。
pause
endlocal
