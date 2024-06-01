export const mustHaveColumn  = () => {
    const saved = localStorage.getItem('personProfileSettings');
    if (!saved) return [];
  
    const parsed = JSON.parse(saved);
    return Object.keys(parsed).filter(key => parsed[key]);
  };

  export const getProfileDataCost = 1
  export const searchProfileCost = 3