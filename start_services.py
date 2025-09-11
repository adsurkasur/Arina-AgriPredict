#!/usr/bin/env python3
"""
Service Manager for AgriPredict
Starts both the Next.js frontend and Python analysis service
"""

import subprocess
import sys
import os
import signal
import time
from pathlib import Path
import threading
import argparse
import shutil
import locale

class ServiceManager:
    def __init__(self):
        self.frontend_process = None
        self.backend_process = None
        self.project_root = Path(__file__).parent
        self.frontend_dir = self.project_root
        self.backend_dir = self.project_root / "analysis-service"
        self.node_path = None
        self.npm_path = None
        self.python_path = None

        # Configuration
        self.frontend_port = 3000  # Default, will be detected dynamically
        self.backend_port = 7860   # Default backend port
        self.hostname = "localhost"  # Default hostname

        # Try to set console encoding for better Unicode support
        try:
            if hasattr(sys.stdout, 'reconfigure'):
                sys.stdout.reconfigure(encoding='utf-8')
                sys.stderr.reconfigure(encoding='utf-8')
        except Exception:
            pass  # Ignore if reconfigure is not available

    def check_dependencies(self):
        """Check if required dependencies are available"""
        print("🔍 Checking dependencies...")

        # Check if Node.js is available
        node_path = shutil.which("node")
        if node_path:
            self.node_path = node_path
            try:
                result = subprocess.run([node_path, "--version"], capture_output=True, text=True)
                if result.returncode == 0:
                    print(f"✅ Node.js found: {result.stdout.strip()}")
                else:
                    print("❌ Node.js not found")
                    return False
            except Exception as e:
                print(f"❌ Error checking Node.js: {e}")
                return False
        else:
            print("❌ Node.js not found")
            return False

        # Check if npm is available
        npm_path = shutil.which("npm")
        if npm_path:
            self.npm_path = npm_path
            try:
                result = subprocess.run([npm_path, "--version"], capture_output=True, text=True)
                if result.returncode == 0:
                    print(f"✅ npm found: {result.stdout.strip()}")
                else:
                    print("❌ npm not found")
                    return False
            except Exception as e:
                print(f"❌ Error checking npm: {e}")
                return False
        else:
            print("❌ npm not found")
            return False

        # Check if Python is available
        python_path = shutil.which("python") or sys.executable
        if python_path:
            self.python_path = python_path
            try:
                result = subprocess.run([python_path, "--version"], capture_output=True, text=True)
                if result.returncode == 0:
                    print(f"✅ Python found: {result.stdout.strip()}")
                else:
                    print("❌ Python not found")
                    return False
            except Exception as e:
                print(f"❌ Error checking Python: {e}")
                return False
        else:
            print("❌ Python not found")
            return False

        return True

    def clean_output(self, text):
        """Clean problematic Unicode characters from output"""
        # Replace common problematic Unicode characters with ASCII equivalents
        replacements = {
            'â–²': '^',      # Triangle up
            'âœ“': '[OK]',   # Check mark
            'â—‹': '[*]',    # Circle
            'âœ': '[OK]',    # Check mark variant
            'â–': '-',       # Dash variants
            'â€': '"',       # Quote variants
            'â€': '"',
            'â€¢': '*',      # Bullet point
            'â€¦': '...',    # Ellipsis
        }

        for bad, good in replacements.items():
            text = text.replace(bad, good)

        return text

    def detect_frontend_port(self):
        """Detect the actual port Next.js is using"""
        # Next.js typically outputs something like:
        # "Local:        http://localhost:3000"
        # or "Local:        http://localhost:3001"

        # Wait a moment for Next.js to start and output port info
        time.sleep(3)

        # Try to detect from the output that's already been captured
        # Look for port information in recent output
        try:
            # Check if we can peek at the output without consuming it
            import io
            if hasattr(self.frontend_process.stdout, 'peek'):
                # Peek at available data without consuming it
                available_data = self.frontend_process.stdout.peek(1024)
                if available_data:
                    lines = available_data.decode('utf-8', errors='ignore').split('\n')
                    for line in lines:
                        if "Local:" in line and "http://" in line:
                            import re
                            match = re.search(r'http://[^:]+:(\d+)', line)
                            if match:
                                detected_port = int(match.group(1))
                                self.frontend_port = detected_port
                                print(f"📍 Detected frontend port: {detected_port}")
                                return detected_port
        except Exception as e:
            print(f"⚠️  Could not peek at frontend output: {e}")

        # Fallback: Check common ports to see which one is actually open
        import socket
        for port in [3000, 3001, 3002]:
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    result = s.connect_ex(('localhost', port))
                    if result == 0:  # Port is open
                        self.frontend_port = port
                        print(f"📍 Detected frontend port: {port}")
                        return port
            except:
                pass

        print(f"⚠️  Using default frontend port: {self.frontend_port}")
        return self.frontend_port

    def detect_backend_port(self):
        """Detect the actual port the backend is using"""
        # FastAPI typically outputs something like:
        # "Uvicorn running on http://0.0.0.0:7860"

        # Wait a moment for FastAPI to start
        time.sleep(2)

        # Try to detect from the output
        try:
            if hasattr(self.backend_process.stdout, 'peek'):
                available_data = self.backend_process.stdout.peek(1024)
                if available_data:
                    lines = available_data.decode('utf-8', errors='ignore').split('\n')
                    for line in lines:
                        if "Uvicorn running on" in line and "http://" in line:
                            import re
                            match = re.search(r'http://[^:]+:(\d+)', line)
                            if match:
                                detected_port = int(match.group(1))
                                self.backend_port = detected_port
                                print(f"📍 Detected backend port: {detected_port}")
                                return detected_port
        except Exception as e:
            print(f"⚠️  Could not peek at backend output: {e}")

        # Fallback to checking the configured port
        import socket
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                result = s.connect_ex(('localhost', self.backend_port))
                if result == 0:  # Port is open
                    print(f"📍 Confirmed backend port: {self.backend_port}")
                    return self.backend_port
        except:
            pass

        print(f"⚠️  Using default backend port: {self.backend_port}")
        return self.backend_port

    def get_network_ip(self):
        """Get the network IP address for external access"""
        try:
            import socket
            # Create a socket to get the local IP
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))  # Connect to Google DNS
            ip = s.getsockname()[0]
            s.close()
            return ip
        except Exception:
            return "localhost"

    def start_frontend(self):
        """Start the Next.js frontend"""
        print("🚀 Starting Next.js frontend...")

        if not self.frontend_dir.exists():
            print(f"❌ Frontend directory not found: {self.frontend_dir}")
            return False

        try:
            # Change to frontend directory and start Next.js
            os.chdir(self.frontend_dir)

            # Check if node_modules exists
            if not (self.frontend_dir / "node_modules").exists():
                print("📦 Installing frontend dependencies...")
                install_result = subprocess.run([self.npm_path, "install"], capture_output=True, text=True)
                if install_result.returncode != 0:
                    print(f"❌ Failed to install frontend dependencies: {install_result.stderr}")
                    return False

            # Start the development server
            self.frontend_process = subprocess.Popen(
                [self.npm_path, "run", "dev"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )

            print("✅ Frontend started successfully")
            return True

        except Exception as e:
            print(f"❌ Failed to start frontend: {e}")
            return False

    def start_backend(self):
        """Start the Python analysis service"""
        print("🤖 Starting analysis service...")

        if not self.backend_dir.exists():
            print(f"❌ Backend directory not found: {self.backend_dir}")
            return False

        try:
            # Change to backend directory
            os.chdir(self.backend_dir)

            # Check if virtual environment exists and activate it
            venv_path = self.backend_dir / "venv"
            if venv_path.exists():
                python_exe = str(venv_path / "Scripts" / "python.exe")
                if not Path(python_exe).exists():
                    python_exe = self.python_path  # Fallback to detected Python
            else:
                python_exe = self.python_path

            # Start the analysis service
            self.backend_process = subprocess.Popen(
                [python_exe, "main.py"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )

            print("✅ Analysis service started successfully")
            return True

        except Exception as e:
            print(f"❌ Failed to start backend: {e}")
            return False

    def monitor_processes(self):
        """Monitor both processes and handle output"""
        def monitor_process(process, name, stream):
            """Monitor a single process stream"""
            try:
                for line in iter(stream.readline, ''):
                    if line.strip():
                        cleaned_line = self.clean_output(line.strip())
                        print(f"[{name}] {cleaned_line}")
            except Exception as e:
                print(f"Error monitoring {name}: {e}")

        # Start monitoring threads
        if self.frontend_process:
            frontend_stdout_thread = threading.Thread(
                target=monitor_process,
                args=(self.frontend_process, "FRONTEND", self.frontend_process.stdout),
                daemon=True
            )
            frontend_stderr_thread = threading.Thread(
                target=monitor_process,
                args=(self.frontend_process, "FRONTEND", self.frontend_process.stderr),
                daemon=True
            )
            frontend_stdout_thread.start()
            frontend_stderr_thread.start()

        if self.backend_process:
            backend_stdout_thread = threading.Thread(
                target=monitor_process,
                args=(self.backend_process, "BACKEND", self.backend_process.stdout),
                daemon=True
            )
            backend_stderr_thread = threading.Thread(
                target=monitor_process,
                args=(self.backend_process, "BACKEND", self.backend_process.stderr),
                daemon=True
            )
            backend_stdout_thread.start()
            backend_stderr_thread.start()

    def wait_for_services(self):
        """Wait for services to be ready"""
        print("⏳ Waiting for services to be ready...")

        # Wait a bit for services to start
        time.sleep(5)

        # Detect actual ports being used
        if not self.frontend_process is None:
            self.detect_frontend_port()
        if not self.backend_process is None:
            self.detect_backend_port()

        # Get network IP for external access
        network_ip = self.get_network_ip()
        self.hostname = network_ip

        # Check if processes are still running
        frontend_running = self.frontend_process and self.frontend_process.poll() is None
        backend_running = self.backend_process and self.backend_process.poll() is None

        if frontend_running:
            print("✅ Frontend is running")
        else:
            print("❌ Frontend failed to start")

        if backend_running:
            print("✅ Backend is running")
        else:
            print("❌ Backend failed to start")

        return frontend_running and backend_running

    def stop_services(self):
        """Stop both services gracefully"""
        print("\n🛑 Stopping services...")

        if self.frontend_process and self.frontend_process.poll() is None:
            print("Stopping frontend...")
            try:
                if os.name == 'nt':  # Windows
                    self.frontend_process.terminate()
                else:
                    os.killpg(os.getpgid(self.frontend_process.pid), signal.SIGTERM)
                self.frontend_process.wait(timeout=10)
                print("✅ Frontend stopped")
            except Exception as e:
                print(f"❌ Error stopping frontend: {e}")
                try:
                    self.frontend_process.kill()
                except:
                    pass

        if self.backend_process and self.backend_process.poll() is None:
            print("Stopping backend...")
            try:
                self.backend_process.terminate()
                self.backend_process.wait(timeout=10)
                print("✅ Backend stopped")
            except Exception as e:
                print(f"❌ Error stopping backend: {e}")
                try:
                    self.backend_process.kill()
                except:
                    pass

    def run(self, frontend_only=False, backend_only=False):
        """Main run method"""
        print("🚀 AgriPredict Service Manager")
        print("=" * 50)

        # Check dependencies
        if not self.check_dependencies():
            print("❌ Dependency check failed")
            return 1

        success = True

        try:
            # Start services
            if not backend_only:
                if not self.start_frontend():
                    success = False

            if not frontend_only:
                if not self.start_backend():
                    success = False

            if not success:
                print("❌ Failed to start one or more services")
                return 1

            # Monitor processes
            self.monitor_processes()

            # Wait for services to be ready
            if self.wait_for_services():
                print("\n" + "=" * 50)
                print("🎉 Services started successfully!")

                # Display URLs with detected ports and network access
                print(f"📱 Frontend (Local):    http://localhost:{self.frontend_port}")
                print(f"📱 Frontend (Network):  http://{self.hostname}:{self.frontend_port}")
                print(f"🔧 Backend (Local):     http://localhost:{self.backend_port}")
                print(f"🔧 Backend (Network):   http://{self.hostname}:{self.backend_port}")
                print(f"📚 API Docs (Local):    http://localhost:{self.backend_port}/docs")
                print(f"📚 API Docs (Network):  http://{self.hostname}:{self.backend_port}/docs")

                print("=" * 50)
                print("Press Ctrl+C to stop all services")
            else:
                print("❌ One or more services failed to start properly")
                return 1

            # Keep running until interrupted
            while True:
                time.sleep(1)

                # Check if processes are still running
                if self.frontend_process and self.frontend_process.poll() is not None:
                    print("❌ Frontend process exited unexpectedly")
                    break

                if self.backend_process and self.backend_process.poll() is not None:
                    print("❌ Backend process exited unexpectedly")
                    break

        except KeyboardInterrupt:
            print("\n🛑 Received shutdown signal")
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            success = False
        finally:
            self.stop_services()

        return 0 if success else 1

def main():
    parser = argparse.ArgumentParser(description="AgriPredict Service Manager")
    parser.add_argument("--frontend-only", action="store_true",
                       help="Start only the frontend")
    parser.add_argument("--backend-only", action="store_true",
                       help="Start only the backend")
    parser.add_argument("--no-monitor", action="store_true",
                       help="Don't monitor process output")
    parser.add_argument("--frontend-port", type=int, default=3000,
                       help="Port for frontend (default: 3000)")
    parser.add_argument("--backend-port", type=int, default=7860,
                       help="Port for backend (default: 7860)")
    parser.add_argument("--hostname", default="localhost",
                       help="Hostname to use for URLs (default: localhost)")

    args = parser.parse_args()

    if args.frontend_only and args.backend_only:
        print("❌ Cannot specify both --frontend-only and --backend-only")
        return 1

    manager = ServiceManager()
    # Override default ports if specified
    manager.frontend_port = args.frontend_port
    manager.backend_port = args.backend_port
    manager.hostname = args.hostname

    return manager.run(
        frontend_only=args.frontend_only,
        backend_only=args.backend_only
    )

if __name__ == "__main__":
    sys.exit(main())
