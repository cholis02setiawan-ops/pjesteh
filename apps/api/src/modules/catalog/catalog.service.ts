// modules/catalog/catalog.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { TenantService } from "../tenant/tenant.service";
import { Money } from "@esteh/money";

@Injectable()
export class CatalogService {
  constructor(
    private prisma: PrismaService,
    private tenantService: TenantService,
  ) {}

  async getMenu(outletId: string) {
    const products = await this.prisma.product.findMany({
      where: { outletId, isActive: true },
      include: {
        category: true,
        variants: { where: { isActive: true } },
        recipeLines: { include: { ingredient: true } },
      },
      orderBy: { category: { sortOrder: "asc" as const } },
    });

    return products.map(p => ({
      ...p,
      variants: p.variants.map(v => ({
        ...v,
        finalPrice: Number(BigInt(p.basePrice) + BigInt(v.priceDelta)),
      })),
    }));
  }

  async getProduct(outletId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, outletId, isActive: true },
      include: {
        category: true,
        variants: { where: { isActive: true } },
        recipeLines: { include: { ingredient: true } },
      },
    });

    if (!product) throw new NotFoundException("Produk tidak ditemukan");
    return product;
  }

  async checkAvailability(outletId: string, productId: string, qty: number) {
    const product = await this.getProduct(outletId, productId);
    const recipe = product.recipeLines;

    const shortages = recipe.map(r => {
      const ingredient = r.ingredient;
      const required = Number(r.quantity) * qty;
      const available = Number(ingredient.stockBalance);
      return {
        ingredient: r.ingredient.name,
        required,
        available,
        sufficient: available >= required,
      };
    });

    const hasShortage = shortages.some(s => !s.sufficient);
    return { available: !hasShortage, shortages };
  }
}
