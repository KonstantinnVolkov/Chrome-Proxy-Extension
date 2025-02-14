// Слушаем команды от popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {    
    if (request.action === "enableVpn") {
        let config = request.config;
        console.log("Parsed WireGuard Config:", config);
        enableVPN(config);
    } else if (request.action === "disableVpn") {
        disableVPN();
    }
    sendResponse({ status: "ok" });
});

function enableVPN(config) {
    if (!config["Peer"] || !config["Peer"]["Endpoint"]) {
        console.error("Ошибка: не найден Endpoint в конфигурации!");
        return;
    }

    // IP-адрес WireGuard-сервера (он же сервер Dante)
    let serverIP = config["Peer"]["Endpoint"].split(":")[0];
    let dantePort = 1080;  // Порт Dante (проверь, какой у тебя настроен!)

    console.log(`Настраиваем прокси на SOCKS5 через ${serverIP}:${dantePort}`);

    let proxyConfig = {
        mode: "fixed_servers",
        rules: {
            singleProxy: {
                scheme: "socks5",
                host: serverIP,
                port: dantePort
            },
            bypassList: [
                "localhost", 
                "127.0.0.1", 
                "::1", 
                "*.local", 
                "10.0.0.0/8",
                "172.16.0.0/12",
                "192.168.0.0/16",
                "cloud.digitalocean.com",
                "git-cards.iba.by"
            ]
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
