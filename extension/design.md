## 🪃 Design 🪃

# Interception des callStatic:

eth_chainId :
    - TODO : Toujours retourner la chainId sur laquelle se passe l'action. Il faut que le gars puisse changer sur le site, mais ça ne fait pas changer dans metamask

eth_blockNumber :
    - TODO : Toujours retourner celui de la chainId de l'action

eth_call :
    - erc-20
        - balanceOf => omniBalanceOf : retourne somme des balanceOf des tokens canoniques sur toutes chaines
        => Tant que rassemble pas, max(balance)
        - allowance => spoofedAllowance : retourne allowance du user au contrat Boomerang sur la chaîne de la meta-tx
        - nonces => TODO : retourne la nonce du user de ce token sur la chaine de la meta-tx
    - multicall :
        - getEthBalance => omniGetEthBalance : retourne getEthBalance + balanceOf des versions wrappées sur toutes chaines
    <!-- - Quoter :
        - Rien à changer. Il prend l'amount permis par le balanceOf spoofé, et le modal affichera les tarifs -->
    <!-- - Chainlink gas price feed :
        - latestAnswer idem -->
    <!-- - v3 pool :
        - liquidity => idem
        - slot0 => idem

Quand clic sur valider : modal avec chemin puis spoof

Soit spoof le approve directement, soit ne jamais l'afficher puis le faire faire explicitement dans le modal

# Interception des transactions :

eth_sendTransaction:
    Ouvrir modal avec infos, simuler tx, l'afficher, puis : {
        - 2 cas : wrap/unwrap weth and uniswap swap
        - TODO : Renvoyer une demande de signature d'une meta-tx qui permet à Boomerang de bridger + swapper
    }

eth_signTypedData_v4 :
    Si permit : {
        - TODO : Permit for Boomerang to use user's tokens
    }

<!-- eth_estimateGas : -->
<!-- eth_accounts : -->

eth_getTransactionByHash : Donner la tx sur la chaine d'arrivée (de l'action)

eth_getTransactionReceipt : Donner la tx sur la chaine d'arrivée (de l'action)




Multicall actuellement :
    - les fait tous en simple
    - sauf les balanceOf qu'il batch car c'est le seul massif sur uniswap à spoofer

Cas général :
    - 



Soit manifest v2 soit declarativeNetRequest



  "declarative_net_request" : {
    "rule_resources" : [{
      "id": "ruleset_1",
      "enabled": true,
      "path": "rules_1.json"
    }]
  },


// https://github.com/Uniswap/redux-multicall/blob/main/src/updater.tsx
// https://github.com/Uniswap/redux-multicall/blob/main/src/utils/callState.ts





Methods :
- Uniswap : window.ethereum mainly, api for quoting, infura in backup
- Beefy : multiple providers, api for price, lp price and apy, each minute
- Aave : surtout pocket, aussi cloudfare-eth, infura, ankr
- Ribbon : bcp window.ethereum, plein de rpcs
- GMX : rpc avax et arb, puis window.ethereum



- eth_call : convex, curve, uniswap, sushi, frax, arrakis
- PocketNetwork : aave
- Leurs propres nodes : pancakeswap, compound 
- Alchemy: yearn
- Infura : Balancer
- Custom API : 1inch



Contract Boomerang :
Vérifie signatures
Forward tokens
Recover function















https://stackoverflow.com/questions/70978021/chrome-extension-how-do-i-use-declarativenetrequest-to-bypass-the-content-secur
https://betterprogramming.pub/chrome-extension-intercepting-and-reading-the-body-of-http-requests-dd9ebdf2348b
https://stackoverflow.com/questions/18534771/chrome-extension-how-to-get-http-response-body
https://stackoverflow.com/questions/72891762/how-to-preserve-query-params-when-use-chrome-declarativenetrequest-in-chrome-ext
https://stackoverflow.com/questions/72142933/modifying-content-security-policy-response-headers-using-declarativenetrequest-a
