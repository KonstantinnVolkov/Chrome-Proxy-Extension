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

    // IP-адрес WireGuard-сервера (он же сервер Dante)
    let serverIP = config["Peer"]["Endpoint"].split(":")[0];
    let dantePort = 1081;  // Порт Dante (проверь, какой у тебя настроен!)

    console.log(`Настраиваем прокси на SOCKS5 через ${serverIP}:${dantePort}`);

    let proxyConfig = {
        mode: "fixed_servers",
        rules: {
            singleProxy: {
                scheme: "socks5",
                host: serverIP,
                port: dantePort
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

// Функция для отключения VPN
function disableVPN() {
    chrome.proxy.settings.clear({ scope: "regular" }, () => {
        console.log("VPN выключен");
        chrome.storage.local.set({ vpnEnabled: false }); 
    });
}
