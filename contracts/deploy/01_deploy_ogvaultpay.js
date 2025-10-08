module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("----------------------------------------------------");
  log("Deploying OGVaultPay contract...");

  const args = []; 

  const deployment = await deploy("OGVaultPay", {
    from: deployer,
    args,
    log: true,
  });

  log(`✅ OGVaultPay deployed at: ${deployment.address}`);

  log("----------------------------------------------------");
};

module.exports.tags = ["OGVaultPay"];
