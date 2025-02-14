document.addEventListener("DOMContentLoaded", function () {
    const mainScreen = document.getElementById("mainScreen");

    const fileInput = document.getElementById("fileInput");
    const viewConfigBtn = document.getElementById("viewConfig");
    const backButton = document.getElementById("backButton");
    const configContent = document.getElementById("configContent");
    const configScreen = document.getElementById("configScreen");

    const saveBypassBtn = document.getElementById("saveBypassBtn");
    const vpnSwitch = document.getElementById('vpnSwitch');  

    const sidebar = document.getElementById("sidebar");
    const openSidebarBtn = document.getElementById("openSidebar");
    const closeSidebarBtn = document.getElementById("closeSidebar");
    const configScreenBtn = document.getElementById('viewConfigBtn');
    const bypassScreenBtn = document.getElementById('bypassScreenBtn');

    
    window.onload = () => {
        // Проверяем состояние прокси при загрузке popup
        chrome.storage.local.get("vpnEnabled", (data) => {
            vpnSwitch.checked = !!data.vpnEnabled;
        });
    };

    // Функция показа бокового меню
    openSidebarBtn.addEventListener("click", () => {
        sidebar.style.width = "100%";
        document.getElementById("main").style.marginLeft = "250px";
    });

    // Функция скрытия бокового меню
    closeSidebarBtn.addEventListener("click", () => {
        sidebar.style.width = "0";
        document.getElementById("main").style.marginLeft = "0";
    });

    vpnSwitch.addEventListener("change", () => {
        if (vpnSwitch.checked) {
            chrome.storage.local.get("wireguardConfig", (data) => {
                if (data.wireguardConfig) {
                    const parsedConfig = window.parseConfig(data.wireguardConfig);
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
