import requests

def test():
    # 1. Check existing product ID 999
    r = requests.get("http://127.0.0.1:5000/api/products/999")
    print("Before:", r.json())
    
    # 2. Add product ID 999
    payload = {
        "id": 999,
        "name": "Xoài",
        "info": "Đồng Tháp"
    }
    r = requests.post("http://127.0.0.1:5000/api/add-product", json=payload)
    print("Add status:", r.status_code, r.text)
    
    # 3. Check again
    r = requests.get("http://127.0.0.1:5000/api/products/999")
    print("After:", r.json())

if __name__ == "__main__":
    test()
