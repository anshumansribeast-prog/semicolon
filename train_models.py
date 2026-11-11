"""Script to train/register Ada and Beast specialized models in local Ollama.
Runs `ollama create <name> -f <modelfile>`.
"""
import subprocess
import sys
import os

SEMICOLON_DIR = r"C:\Users\Anshu\semicolon"
COSMOS_DIR = r"C:\Users\Anshu\astronomy-site"

def build_model(name, modelfile_path):
    print(f"\n[Training] Building model '{name}' from {modelfile_path}...")
    try:
        proc = subprocess.run(
            ["ollama", "create", name, "-f", modelfile_path],
            capture_output=True,
            text=True,
            check=True
        )
        print(proc.stdout)
        print(f"[Success] Model '{name}' created successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[Error] Failed to create '{name}': {e.stderr}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"[Exception] {e}", file=sys.stderr)
        return False

def main():
    ada_modelfile = os.path.join(SEMICOLON_DIR, "Modelfile.ada")
    beast_modelfile = os.path.join(COSMOS_DIR, "Modelfile.beast")

    ada_ok = build_model("ada-tutor", ada_modelfile)
    beast_ok = build_model("beast-astronomy", beast_modelfile)

    print("\n[Summary]")
    print(f"ada-tutor: {'READY' if ada_ok else 'FAILED'}")
    print(f"beast-astronomy: {'READY' if beast_ok else 'FAILED'}")

if __name__ == "__main__":
    main()
