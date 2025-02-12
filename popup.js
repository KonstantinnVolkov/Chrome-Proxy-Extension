document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("fileInput");
    const viewConfigBtn = document.getElementById("viewConfig");
    const backButton = document.getElementById("backButton");
    const configContent = document.getElementById("configContent");
    const mainScreen = document.getElementById("mainScreen");
    const configScreen = document.getElementById("configScreen");
    const saveBypassBtn = document.getElementById("saveBypassBtn");
    const vpnSwitch = document.getElementById('vpnSwitch');  
    
    window.onload = () => {
        // Проверяем состояние прокси при загрузке popup
        chrome.storage.local.get("vpnEnabled", (data) => {
            vpnSwitch.checked = !!data.vpnEnabled;
        });
    };

    vpnSwitch.addEventListener("change", () => {
        if (vpnSwitch.checked) {
            chrome.storage.local.get("wireguardConfig", (data) => {
                if (data.wireguardConfig) {
                    const parsedConfig = parseConfig(data.wireguardConfig);
                    chrome.runtime.sendMessage({ action: "enableVpn", config: parsedConfig });
                } else {
                    alert("Конфигурация WireGuard не загружена!");
                    vpnSwitch.checked = false;
                }
            });
        } else {
            chrome.runtime.sendMessage({ action: "disableVpn" });
        }
    });

    // Функция парсинга конфигурационного файла WireGuard
    function parseConfig(configText) {
        const config = {};
        const lines = configText.split("\n");
        
        let currentSection = null;

        lines.forEach(line => {
            line = line.trim();
            if (line.startsWith("[") && line.endsWith("]")) {
                currentSection = line.slice(1, -1);
                config[currentSection] = {};
            } else if (currentSection && line.includes("=")) {
                const [key, value] = line.split("=").map(s => s.trim());
                config[currentSection][key] = value;
            }
        });
        return config;
    };
    // Обработка загрузки файла
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const fileContent = e.target.result;
                // Сохраняем конфигурацию в chrome.storage
                chrome.storage.local.set({ wireguardConfig: fileContent }, () => {
                    alert("Config loaded!");
                });
            };
            reader.readAsText(file);
        }
    });

    // Переход к экрану просмотра конфигурации
    viewConfigBtn.addEventListener("click", () => {
        chrome.storage.local.get("wireguardConfig", (data) => {
            if (data.wireguardConfig) {
                configContent.textContent = data.wireguardConfig;
            } else {
                configContent.textContent = "No config provided.";
            }
            mainScreen.style.display = "none";
            configScreen.style.display = "block";
        });
    });

    // Возвращение на главный экран
    backButton.addEventListener("click", () => {
        mainScreen.style.display = "block";
        configScreen.style.display = "none";
    });
});
