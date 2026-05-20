const http = require("http");
const { URL } = require("url");
const { TraceabilityBlockchain } = require("./blockchain");

const PORT = Number(process.env.PORT || 5000);
const blockchain = new TraceabilityBlockchain(3);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  response.end(JSON.stringify(payload, null, 2));
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";

    request.on("data", (chunk) => {
      raw += chunk;
    });

    request.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("Body JSON khong hop le."));
      }
    });

    request.on("error", reject);
  });
}

async function handleRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = url.pathname;

  if (request.method === "OPTIONS") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  try {
    if (request.method === "GET" && pathname === "/") {
      sendJson(response, 200, {
        status: "ok",
        message: "Backend JavaScript local blockchain dang chay.",
        routes: {
          health: "/health",
          config: "/api/config",
          products: "/api/products",
          lookupSample: "/api/products/1",
          createProduct: "POST /api/products",
          updateProduct: "POST /api/products/:id/updates",
          chain: "/api/chain"
        }
      });
      return;
    }

    if (request.method === "GET" && pathname === "/health") {
      sendJson(response, 200, { status: "ok", runtime: "node" });
      return;
    }

    if (request.method === "GET" && pathname === "/api/config") {
      sendJson(response, 200, {
        ...blockchain.getSummary(),
        rpcUrl: null,
        contractAddress: null,
        readMethod: "local-js-read",
        abiLoaded: false
      });
      return;
    }

    if (request.method === "GET" && pathname === "/api/chain") {
      sendJson(response, 200, {
        status: "success",
        summary: blockchain.getSummary(),
        products: blockchain.listProducts(),
        chain: blockchain.chain
      });
      return;
    }

    if (request.method === "GET" && pathname === "/api/products") {
      sendJson(response, 200, {
        status: "success",
        products: blockchain.listProducts()
      });
      return;
    }

    if (request.method === "POST" && pathname === "/api/products") {
      const body = await parseBody(request);
      const result = blockchain.createProduct({
        id: Number(body.id),
        ten: body.ten,
        thongTinDauTien: body.thongTinDauTien,
        nguoiTao: body.nguoiTao
      });

      sendJson(response, 201, {
        status: "success",
        message: "Da tao lo hang moi tren local blockchain.",
        source: "local-js-blockchain",
        data: result.product,
        minedBlock: result.block
      });
      return;
    }

    const productMatch = pathname.match(/^\/api\/products\/(\d+)$/);
    if (request.method === "GET" && productMatch) {
      const productId = Number(productMatch[1]);
      sendJson(response, 200, {
        status: "success",
        productId,
        source: "local-js-blockchain",
        data: blockchain.getProduct(productId)
      });
      return;
    }

    const updateMatch = pathname.match(/^\/api\/products\/(\d+)\/updates$/);
    if (request.method === "POST" && updateMatch) {
      const productId = Number(updateMatch[1]);
      const body = await parseBody(request);
      const result = blockchain.updateProduct({
        id: productId,
        thongTinMoi: body.thongTinMoi,
        nguoiCapNhat: body.nguoiCapNhat
      });

      sendJson(response, 200, {
        status: "success",
        message: "Da cap nhat trang thai lo hang tren local blockchain.",
        productId,
        source: "local-js-blockchain",
        data: result.product,
        minedBlock: result.block
      });
      return;
    }

    sendJson(response, 404, {
      status: "error",
      error: "Khong tim thay endpoint."
    });
  } catch (error) {
    sendJson(response, 400, {
      status: "error",
      error: error.message
    });
  }
}

http
  .createServer((request, response) => {
    handleRequest(request, response);
  })
  .listen(PORT, "0.0.0.0", () => {
    console.log(`Local JS blockchain server dang chay tai http://127.0.0.1:${PORT}`);
  });
