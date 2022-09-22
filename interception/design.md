# 🪃 Design 🪃


Interception :

eth_call :
- balanceOf : Remplacer addresses tokens, lancer sur toutes les chaines, agréger, retourner valeur
- allowance : Remplacer addresse contract, lancer sur même chaine, retourner valeur

Cas :
- Call normal
    - spoof
- multicall


eth_call = {
    to:
    data:
}

if (to == multicall) {
    decode => trier => call on multiple => aggréger => encoder
}












Methods :
- eth_call : convex, curve, uniswap, sushi, frax, arrakis
- PocketNetwork : aave
- Leurs propres nodes : pancakeswap, compound 
- Alchemy: yearn
- Infura : Balancer
- Custom API : 1inch



sendTransaction :
- 




Contract Boomerang :
Vérifie signatures
Forward tokens
Recover function