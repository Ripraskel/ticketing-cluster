resource "azurerm_container_registry" "ticketing_cluster" {
  name                = "RipraskelRegistry"
  resource_group_name = azurerm_resource_group.ticketing_cluster.name
  location            = azurerm_resource_group.ticketing_cluster.location
  sku                 = "Basic"
}
resource "random_pet" "azurerm_kubernetes_cluster_name" {
  prefix = "cluster"
}

resource "random_pet" "azurerm_kubernetes_cluster_dns_prefix" {
  prefix = "dns"
}


resource "azurerm_kubernetes_cluster" "ticketing_cluster" {
  name                = random_pet.azurerm_kubernetes_cluster_name.id
  location            = azurerm_resource_group.ticketing_cluster.location
  resource_group_name = azurerm_resource_group.ticketing_cluster.name
  dns_prefix          = random_pet.azurerm_kubernetes_cluster_dns_prefix.id

  default_node_pool {
    name       = "agentpool"
    node_count = 1
    vm_size    = "Standard_D2_v2"
  }

 linux_profile {
    admin_username = "Rich"

    ssh_key {
      key_data = azapi_resource_action.ssh_public_key_gen.output.publicKey
    }
  }
  network_profile {
    network_plugin    = "kubenet"
    load_balancer_sku = "standard"
  }
  identity {
    type = "SystemAssigned"
  }
}

resource "azurerm_role_assignment" "ticketing_cluster" {
  principal_id                     = azurerm_kubernetes_cluster.ticketing_cluster.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                            = azurerm_container_registry.ticketing_cluster.id
  skip_service_principal_aad_check = true
}