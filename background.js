const proxyMode = 'fixed_servers';
const proxyScheme = 'socks5';
const proxyPort = 1082;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {    
    if (request.action === "enableVpn") {
        const bypassList = request.bypassList;
        const config = request.config;
        console.log("Parsed WireGuard Config:", config);
        enableVPN(config, bypassList);
    } else if (request.action === "disableVpn") {
        disableVPN();
    }
    sendResponse({ status: "ok" });
});

function enableVPN(config, bypassList) {
    if (!config["Peer"] || !config["Peer"]["Endpoint"]) {
        console.error("Ошибка: не найден Endpoint в конфигурации!");
        return;
    }

    let proxyIP = config["Peer"]["Endpoint"].split(":")[0];
    console.log(`Настраиваем прокси на SOCKS5 через ${proxyIP}:${proxyPort}`);

    let proxyConfig = {
        mode: proxyMode,
        rules: {
            singleProxy: {
                scheme: proxyScheme,
                host: proxyIP,
                port: proxyPort
            },
            bypassList: bypassList
        }
    };
    console.log(proxyConfig);
    

    chrome.proxy.settings.set({ value: proxyConfig, scope: "regular" }, () => {
        console.log("VPN включён через Dante-прокси");
        chrome.storage.local.set({ vpnEnabled: true });
    });
}

function disableVPN() {
    chrome.proxy.settings.clear({ scope: "regular" }, () => {
        console.log("VPN выключен");
        chrome.storage.local.set({ vpnEnabled: false }); 
    });
}
