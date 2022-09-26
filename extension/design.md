## 🪃 Design 🪃

# Interception des callStatic:

eth_chainId :
    - TODO : Toujours retourner 1 ?

eth_blockNumber :
    - TODO : Toujours le rassurer

eth_call :
    - erc-20
        - balanceOf => omniBalanceOf : retourne somme des balanceOf des tokens canoniques sur toutes chaines
        - allowance => spoofedAllowance : retourne allowance du user au contrat Boomerang sur la chaîne de la meta-tx
        - nonces => TODO : retourne la nonce du user de ce token sur la chaine de la meta-tx
        - Deposit (WETH) => TODO
    - multicall :
        - getEthBalance => omniGetEthBalance : retourne getEthBalance + balanceOf des versions wrappées sur toutes chaines
    - Quoter :
        - quoteExactOutput => TODO : retourner notre estimation du prix
        - quoteExactOutputSingle => TODO : retourner notre estimation du prix
    - Chainlink gas price feed :
        - latestAnswer => TODO : gasPrice on the chain of the meta-tx ? final fee estimate ? 
    - v3 pool :
        - liquidity => TODO
        - slot0 => TODO



# Interception des transactions :

eth_sendTransaction:
    - TODO : Renvoyer une demande de signature d'une meta-tx qui permet à Boomerang de bridger + swapper

eth_signTypedData_v4 :
    - TODO : Permit for Boomerang to use user's tokens

eth_estimateGas :

eth_accounts :

eth_sendTransaction :

eth_getTransactionByHash :

eth_getTransactionReceipt :












Cas pour multicall :
    - Tous les faire en simple
    - En faire certains en simple

TODO : massiveOmniBalanceOf détecte les calls différents












// https://github.com/Uniswap/redux-multicall/blob/main/src/updater.tsx
// https://github.com/Uniswap/redux-multicall/blob/main/src/utils/callState.ts





Methods :
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