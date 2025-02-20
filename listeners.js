document.addEventListener("DOMContentLoaded", function () {
    const mainScreen = document.getElementById("mainScreen");

    const fileInput = document.getElementById("fileInput");
    const configContent = document.getElementById("configContent");

    const vpnSwitch = document.getElementById('vpnSwitch');  

    const sidebar = document.getElementById("sidebar");
    const openSidebarBtn = document.getElementById("openSidebar");
    const closeSidebarBtn = document.getElementById("closeSidebar");

    const VPNScreenBtn = document.getElementById('VPNScreenBtn');
    const configScreenBtn = document.getElementById('configScreenBtn');
    const bypassScreenBtn = document.getElementById('bypassScreenBtn');

    const vpnSection = document.getElementById("vpnSection");
    const configSection = document.getElementById("configSection");
    const bypassHostsSection = document.getElementById("excludesHostsSection");

    const bypassListEl = document.getElementById("bypassList");
    const addBypassBtn = document.getElementById("addBypassBtn");
    const bypassPopup = document.getElementById("bypassPopup");
    const saveBypassBtn = document.getElementById("saveBypassBtn");
    const closePopupBtn = document.getElementById("closePopupBtn");
    const bypassInput = document.getElementById("bypassInput");

    let bypassList = [];     

    window.onload = () => {   
        vpnSection.style.display='block';
        configSection.style.display='none';
        bypassHostsSection.style.display='none';
        
        // Проверяем состояние прокси при загрузке popup
        chrome.storage.local.get("vpnEnabled", (data) => {
            vpnSwitch.checked = !!data.vpnEnabled;
        });
    };

    // Функция показа бокового меню
    openSidebarBtn.addEventListener("click", () => {
        sidebar.style.width = "100%";
    });

    // Функция скрытия бокового меню
    closeSidebarBtn.addEventListener("click", () => {
        sidebar.style.width = "0";
    });

    vpnSwitch.addEventListener("change", () => {
        if (vpnSwitch.checked) {
            chrome.storage.local.get("bypassList", (data) => bypassList = data.bypassList);
            chrome.storage.local.get("wireguardConfig", (data) => {
                if (data.wireguardConfig) {
                    const parsedConfig = window.parseConfig(data.wireguardConfig);
                    chrome.runtime.sendMessage({ action: "enableVpn", config: parsedConfig, bypassList: bypassList });
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

    VPNScreenBtn.addEventListener("click", () => {
        vpnSection.style.display='block';
        configSection.style.display='none';
        bypassHostsSection.style.display='none';
        sidebar.style.width = "0";
    });

    // Переход к экрану просмотра конфигурации
    configScreenBtn.addEventListener("click", () => {
        vpnSection.style.display='none';
        configSection.style.display='block';
        bypassHostsSection.style.display='none';
        sidebar.style.width = "0";

        chrome.storage.local.get("wireguardConfig", (data) => {
            if (data.wireguardConfig) {
                configContent.textContent = data.wireguardConfig;
            } else {
                configContent.textContent = "No config provided.";
            }
        });
    });

    bypassScreenBtn.addEventListener("click", () => {
        vpnSection.style.display='none';
        configSection.style.display='none';
        bypassHostsSection.style.display='block';
        sidebar.style.width = "0";

        chrome.storage.local.get('bypassList', (data) => {
           bypassList = data.bypassList || [];
           console.log(bypassList);
           
           renderBypassList(); 
        });

        renderBypassList();
    })

    function renderBypassList() {
        bypassListEl.innerHTML = "";
    
        bypassList.forEach((host, index) => {
            const li = document.createElement("li");
            li.textContent = host;
            li.classList.add("bypass-item");
    
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "×";
            removeBtn.classList.add("btn", "remove-btn");
            removeBtn.onclick = () => {
                bypassList.splice(index, 1);
                saveBypassList();
            };
    
            li.appendChild(removeBtn);
            bypassListEl.appendChild(li);
        });
    }
    

    function saveBypassList() {
        chrome.storage.local.set({ bypassList }, () => {
            renderBypassList();
        });
    }

    addBypassBtn.addEventListener("click", () => {
        bypassPopup.style.display = "block";
    });

    closePopupBtn.addEventListener("click", () => {
        bypassPopup.style.display = "none";
    });

    saveBypassBtn.addEventListener("click", () => {
        const newHost = bypassInput.value.trim();
        if (newHost) {
            bypassList.push(newHost);
            bypassInput.value = "";
            bypassPopup.classList.add("hidden");
            saveBypassList();
        }
        bypassPopup.style.display = "none";
    });

    chrome.storage.local.get("bypassList", (data) => {
        bypassList = data.bypassList || [];
        renderBypassList();
    });
});
