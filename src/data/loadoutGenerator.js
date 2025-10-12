import { classes } from "../data/classes.js";


export const generateRandomLoadout = () => {
    const classNames = Object.keys(classes);
    const randomClassName = classNames[Math.floor(Math.random() * classNames.length)];
    const playerClass = classes[randomClassName];

    const randomWeapon = playerClass.weapons[Math.floor(Math.random() * playerClass.weapons.length)];
    const shuffledEquipment = [...playerClass.equipment].sort(() => Math.random() - 0.5);
    const shuffledAbilities = [...playerClass.abilities].sort(() => Math.random() - 0.5);
    const randomEquipment = shuffledEquipment.slice(0, 4);
    const randomAbility = shuffledAbilities[Math.floor(Math.random() * shuffledAbilities.length)];
    return {
        className : randomClassName,
        ability : randomAbility,
        weapon : randomWeapon,
        equipment: randomEquipment

    };

};