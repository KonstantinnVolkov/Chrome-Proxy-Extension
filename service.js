window.parseConfig = (configText) => {
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