
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { tradingAssets } from "@/utils/tradingUtils";

interface AssetSettingsProps {
  selectedAssets: string[];
  onAssetToggle: (assetId: string) => void;
}

const AssetSettings: React.FC<AssetSettingsProps> = ({ selectedAssets, onAssetToggle }) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Ativos para Operar</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {tradingAssets.map(asset => (
          <div key={asset.id} className="flex items-center space-x-2">
            <Switch 
              id={`asset-${asset.id}`}
              checked={selectedAssets.includes(asset.id)}
              onCheckedChange={() => onAssetToggle(asset.id)}
            />
            <Label htmlFor={`asset-${asset.id}`} className="cursor-pointer">
              {asset.symbol}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetSettings;
