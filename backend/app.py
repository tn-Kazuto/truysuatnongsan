import json
import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from web3 import Web3

BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
ABI_PATH = BASE_DIR / "abi" / "TruySuatNongSan.json"
ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

load_dotenv(ENV_PATH)

app = Flask(__name__)
CORS(app)


def normalize_value(value):
    if isinstance(value, bytes):
        return value.hex()

    if isinstance(value, (list, tuple)):
        return [normalize_value(item) for item in value]

    if isinstance(value, dict):
        return {key: normalize_value(item) for key, item in value.items()}

    return value


def read_settings():
    return {
        "rpc_url": os.getenv("WEB3_RPC_URL", "https://rpc-amoy.polygon.technology"),
        "contract_address": os.getenv("WEB3_CONTRACT_ADDRESS", ZERO_ADDRESS),
        "read_method": os.getenv("WEB3_READ_METHOD", "danhSachSanPham"),
    }


def load_abi():
    if not ABI_PATH.exists():
        raise FileNotFoundError("Khong tim thay file ABI trong backend/abi.")

    abi = json.loads(ABI_PATH.read_text(encoding="utf-8"))

    if not isinstance(abi, list) or not abi:
        raise ValueError("ABI dang rong. Hay paste JSON ABI tu Remix vao backend/abi/TruySuatNongSan.json.")

    return abi


def get_contract():
    settings = read_settings()
    contract_address = settings["contract_address"]

    if contract_address == ZERO_ADDRESS:
        raise ValueError("Ban chua cap nhat WEB3_CONTRACT_ADDRESS trong backend/.env.")

    if not Web3.is_address(contract_address):
        raise ValueError("WEB3_CONTRACT_ADDRESS khong hop le.")

    abi = load_abi()
    web3_client = Web3(Web3.HTTPProvider(settings["rpc_url"]))

    if not web3_client.is_connected():
        raise ConnectionError(f"Khong ket noi duoc RPC: {settings['rpc_url']}")

    contract = web3_client.eth.contract(
        address=Web3.to_checksum_address(contract_address),
        abi=abi,
    )

    return contract, settings


@app.get("/health")
def health_check():
    return jsonify({"status": "ok"})


@app.get("/")
def index():
    return jsonify(
        {
            "status": "ok",
            "message": "Backend Flask dang chay.",
            "routes": {
                "health": "/health",
                "config": "/api/config",
                "sampleProduct": "/api/products/1",
            },
        }
    )


@app.get("/api/config")
def get_config():
    settings = read_settings()
    return jsonify(
        {
            "chain": "Polygon Amoy",
            "rpcUrl": settings["rpc_url"],
            "contractAddress": settings["contract_address"],
            "readMethod": settings["read_method"],
            "abiLoaded": ABI_PATH.exists() and ABI_PATH.read_text(encoding="utf-8").strip() not in {"", "[]"},
        }
    )


@app.get("/api/products/<int:product_id>")
def get_product(product_id):
    try:
        contract, settings = get_contract()
        contract_method = getattr(contract.functions, settings["read_method"], None)

        if contract_method is None:
            raise AttributeError(
                f"Contract khong co ham {settings['read_method']}(uint256)."
            )

        raw_product = contract_method(product_id).call()

        return jsonify(
            {
                "status": "success",
                "productId": product_id,
                "source": "blockchain-via-backend",
                "readMethod": settings["read_method"],
                "data": normalize_value(raw_product),
            }
        )
    except Exception as error:
        return (
            jsonify(
                {
                    "status": "error",
                    "productId": product_id,
                    "error": str(error),
                }
            ),
            500,
        )


@app.post("/api/add-product")
def add_product():
    data = request.json
    p_id = data.get('id')
    p_name = data.get('name')
    p_info = data.get('info')

    try:
        contract, settings = get_contract()
        w3 = contract.w3
        
        # Hardhat pre-funded Account #0
        SENDER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
        
        nonce = w3.eth.get_transaction_count(SENDER_ADDRESS)
        tx = contract.functions.taoMoiLoHang(int(p_id), p_name, p_info).build_transaction({
            'chainId': 31337,
            'gas': 2000000,
            'gasPrice': w3.eth.gas_price,
            'nonce': nonce,
        })
        
        signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
        
        # Support both Web3.py v5 and v6
        raw_tx = getattr(signed_tx, 'raw_transaction', getattr(signed_tx, 'rawTransaction', None))
        
        tx_hash = w3.eth.send_raw_transaction(raw_tx)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        if receipt.status == 0:
            raise Exception("Transaction reverted by the EVM.")
            
        return jsonify({"status": "Success", "tx_hash": tx_hash.hex()})
    except Exception as error:
        return jsonify({"status": "error", "error": str(error)}), 500


if __name__ == "__main__":
    debug_enabled = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    app.run(host="0.0.0.0", port=5000, debug=debug_enabled)
