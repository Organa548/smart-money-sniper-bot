
export class SubscriptionManager {
  private activeAssets: string[] = [];

  constructor(private send: (message: any) => void) {}

  public subscribe(symbol: string): void {
    console.log(`Assinando ticks para ${symbol}`);
    
    if (!this.activeAssets.includes(symbol)) {
      this.activeAssets.push(symbol);
    }
    
    this.send({
      ticks: symbol,
      subscribe: 1,
      req_id: 2 + this.activeAssets.indexOf(symbol)
    });
  }

  public unsubscribe(symbol: string): void {
    console.log(`Cancelando assinatura para ${symbol}`);
    this.activeAssets = this.activeAssets.filter(a => a !== symbol);
    
    this.send({
      forget_all: "ticks",
      req_id: 100
    });
    
    if (this.activeAssets.length > 0) {
      console.log(`Reassinando ${this.activeAssets.length} ativos restantes`);
      this.activeAssets.forEach((asset, index) => {
        this.send({
          ticks: asset,
          subscribe: 1,
          req_id: 101 + index
        });
      });
    }
  }

  public updateSubscriptions(selectedAssets: string[]): void {
    console.log(`Atualizando assinaturas. Ativos selecionados: ${selectedAssets.join(', ')}`);
    
    if (this.activeAssets.length > 0) {
      this.send({
        forget_all: "ticks",
        req_id: 200
      });
      
      this.activeAssets = [];
    }
    
    selectedAssets.forEach((assetId, index) => {
      this.activeAssets.push(assetId);
      this.send({
        ticks: assetId,
        subscribe: 1,
        req_id: 201 + index
      });
    });
  }

  public getActiveAssets(): string[] {
    return [...this.activeAssets];
  }
}
