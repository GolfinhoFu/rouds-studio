
export const TemplateStrategies = {
    VANILLA: 'Vanilla',
    MODS_PLUS: 'ModsPlus',
    CUSTOM: 'Custom'
};

export function generateCardCode(strategy, customTemplate, projectInfo, cardInfo) {
    let template = "";

    if (strategy === TemplateStrategies.CUSTOM && customTemplate) {
        template = customTemplate;
    } else if (strategy === TemplateStrategies.MODS_PLUS) {
        template = getModsPlusTemplate();
    } else {
        template = getDefaultVanillaTemplate();
    }

    const cleanModName = projectInfo.name.replace(/[^a-zA-Z0-9]/g, "");

    return template
        .replace(/{{NAME}}/g, cardInfo.name || "CardName")
        .replace(/{{DESC}}/g, cardInfo.desc || "Description")
        .replace(/{{MODNAME}}/g, cleanModName || "MyMod")
        .replace(/{{RARITY}}/g, cardInfo.rarity || "Common")
        .replace(/{{THEME}}/g, cardInfo.theme || "DestructiveRed");
}

export function getDefaultVanillaTemplate() {
    return `using System;
using UnityEngine;
using UnboundLib;
using UnboundLib.Cards;

namespace {{MODNAME}}.Cards
{
    class {{NAME}} : CustomCard
    {
        public override void SetupCard(CardInfo cardInfo, Gun gun, ApplyCardStats cardStats, CharacterStatModifiers statModifiers, Block block)
        {
            // [STATS HERE]
            
            UnityEngine.Debug.Log("[{{NAME}}] Setup Completed");
        }

        public override void OnAddCard(Player player, Gun gun, GunAmmo gunAmmo, CharacterData data, HealthHandler health, Gravity gravity, Block block, CharacterStatModifiers characterStats)
        {
            // [PASSIVES HERE]
        }

        public override void OnRemoveCard(...) { }

        protected override string GetTitle() { return "{{NAME}}"; }
        protected override string GetDescription() { return "{{DESC}}"; }
        protected override GameObject GetCardArt() { return null; }
        protected override CardInfo.Rarity GetRarity() { return CardInfo.Rarity.{{RARITY}}; }
        protected override CardThemeColor.CardThemeColorType GetTheme() { return CardThemeColor.CardThemeColorType.{{THEME}}; }
        public override string GetModName() { return "{{MODNAME}}"; }
    }
`;
}

export function getModsPlusTemplate() {
    return `using System;
using System.Collections.Generic;
using UnityEngine;
using ModsPlus; // Requires ModsPlus
using RarityLib.Utils;

public class {{NAME}} : SimpleCard
{
    public override CardDetails Details => new CardDetails
    {
        Title       = "{{NAME}}",
        Description = "{{DESC}}",
        ModName     = "{{MODNAME}}",
        Rarity      = RarityUtils.GetRarity("{{RARITY}}"),
        Theme       = CardThemeColor.CardThemeColorType.{{THEME}},
        Art         = null 
    };

    public override void SetupCard(CardInfo cardInfo, Gun gun, ApplyCardStats cardStats, CharacterStatModifiers statModifiers, Block block)
    {
        Dictionary<string, Action<float>> actions = new Dictionary<string, Action<float>>
        {
            { "damage", (val) => { gun.damage = val; } },
            { "health", (val) => { statModifiers.health = val; } },
            // Add more stats here
        };
    }
}`;
}
