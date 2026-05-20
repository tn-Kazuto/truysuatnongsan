import json
import os
from pathlib import Path
from web3 import Web3

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
ARTIFACT_PATH = ROOT_DIR / "artifacts" / "contracts" / "TruySuatNongSan.sol" / "TruySuatNongSan.json"
ENV_PATH = BASE_DIR / ".env"
ABI_PATH = BASE_DIR / "abi" / "TruySuatNongSan.json"

def main():
    # Load artifact
    with open(ARTIFACT_PATH, 'r') as f:
        artifact = json.load(f)
    
    abi = artifact['abi']
    bytecode = artifact['bytecode']
    
    # Save ABI to backend/abi/TruySuatNongSan.json
    os.makedirs(ABI_PATH.parent, exist_ok=True)
    with open(ABI_PATH, 'w') as f:
        json.dump(abi, f, indent=4)
        
    print("Saved ABI to", ABI_PATH)
    
    # Connect to Hardhat
    w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
    if not w3.is_connected():
        print("Failed to connect to Hardhat node!")
        return
        
    print("Connected to Hardhat node.")
    
    # Use Account #0 from Hardhat
    w3.eth.default_account = w3.eth.accounts[0]
    
    # Deploy
    Contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    tx_hash = Contract.constructor().transact()
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    contract_address = tx_receipt.contractAddress
    print("Deployed contract to:", contract_address)
    
    # Update .env
    env_content = []
    if ENV_PATH.exists():
        with open(ENV_PATH, 'r') as f:
            env_content = f.readlines()
            
    new_env_content = []
    for line in env_content:
        if line.startswith("WEB3_RPC_URL="):
            continue
        if line.startswith("WEB3_CONTRACT_ADDRESS="):
            continue
        new_env_content.append(line)
        
    new_env_content.append("WEB3_RPC_URL=http://127.0.0.1:8545\n")
    new_env_content.append(f"WEB3_CONTRACT_ADDRESS={contract_address}\n")
    
    with open(ENV_PATH, 'w') as f:
        f.writelines(new_env_content)
        
    print("Updated backend/.env")

if __name__ == "__main__":
    main()
