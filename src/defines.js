export default {
    fuels : [
        { name: "石炭", acc_mult: 1, top_speed_mult: 1, img: "coal.png" },
        { name: "固形燃料", acc_mult: 1.2, top_speed_mult: 1.05, img: "solid-fuel.png" },
        { name: "ロケット燃料", acc_mult: 1.8, top_speed_mult: 1.15, img: "rocket-fuel.png" },
        { name: "核燃料", acc_mult: 2.5, top_speed_mult: 1.15, mg: "nuclear-fuel.png" },
    ],
    
    breaking_bonuses : [
        0, 0.1, 0.25, 0.40, 0.55, 0.70, 0.85, 1.00
    ],
    
    vehicles : [
        { id: "locomotive_active", name: "機関車（前向き）", min: 1, weight: 2000, max_speed: 1.2, max_power: 10, friction_force: 0.5, air_resistance: 0.0075, braking_force: 10, img: "locomotive.png" },
        { id: "locomotive_inactive", name: "機関車（後向き）", min: 0, weight: 2000, max_speed: 1.2, max_power: 0, friction_force: 0.5, air_resistance: 0.0075, braking_force: 10, img: "locomotive-r.png" },
        { id: "cargo_wagon", name: "貨物車両", min: 0, weight: 1000, max_speed: 1.5, max_power: 0, friction_force: 0.5, air_resistance: 0.01, braking_force: 3, img: "cargo.png" },
        { id: "artillery_wagon", name: "列車砲", min: 0, weight: 4000, max_speed: 1.5, max_power: 0, friction_force: 0.5, air_resistance: 0.015, braking_force: 3, img: "artillery.png" },
    ]    
}