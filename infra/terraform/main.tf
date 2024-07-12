
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=3.111.0"
    }
    azapi = {
      source  = "azure/azapi"
      version = "~>1.5"
    }
    random = {
      source  = "hashicorp/random"
      version = "~>3.0"
    }
    time = {
      source  = "hashicorp/time"
      version = "0.9.1"
    }
  }
}

# Configure the Microsoft Azure Provider
provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "ticketing_cluster" {
  name     = "ticketing-cluster"
  location = "UK South"
}

resource "azurerm_virtual_network" "ticketing_cluster" {
  name                = "ticketing-cluster-vnet"
  resource_group_name = azurerm_resource_group.ticketing_cluster.name
  location            = azurerm_resource_group.ticketing_cluster.location
  address_space       = ["10.0.0.0/16"]
}