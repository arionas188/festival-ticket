export function getMergedData(translations, meta, lang) {
    return translations[lang].map(item => ({
        ...item,           // παίρνει id + name
        ...meta[item.id],  // προσθέτει price + status
    }));
}