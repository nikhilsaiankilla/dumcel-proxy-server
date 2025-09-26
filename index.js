const express = require('express');
const httpProxy = require('http-proxy');
const { connectDb } = require('./db');
const ProjectModel = require('./models/project');

const app = express();
const PORT = process.env.PORT || 8000;

const BASE_URL = "https://dumcel-build-outputs.s3.ap-south-1.amazonaws.com/_output"
const proxy = httpProxy.createProxyServer();

(async () => {
    await connectDb();
    console.log("MongoDB connected.");
})();

app.get('/', () => { return res.status(200).send('reverse proxy running') })

app.use(async (req, res) => {
    const hostName = req.headers.host;
    const subDomain = hostName.split('.')[0];

    try {
        const project = await ProjectModel.findOne({ subDomain }).lean();

        if (!project) {
            return res.status(404).send('Not Found');
        }

        const projectId = project._id;

        const resolveTo = `${BASE_URL}/${projectId}`;
        return proxy.web(req, res, { target: resolveTo, changeOrigin: true });
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

proxy.on('proxyReq', (proxyReq, req, res) => { const url = req.url; if (url === '/') { proxyReq.path += 'index.html'; } return proxyReq; })

app.get('app/health', (req, res) => {
    res.status(200).send('Health OK');
})

app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Reverse proxy running on http://localhost:${PORT}`)
})