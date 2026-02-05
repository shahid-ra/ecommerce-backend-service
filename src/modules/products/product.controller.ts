import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import {
  CreateProductDto,
  UpdateInventoryDto,
  UpdateProductDto,
} from './product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  public async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto as any);
  }

  @Get()
  public async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('category') category?: string,
  ) {
    const filters: any = { deleted: false, isActive: true };
    if (category) {
      filters.category = category;
    }
    return this.productService.findResources(filters, {
      limit: limit || 10,
      offset: offset || 0,
    });
  }

  @Get(':id')
  public async findOne(@Param('id') id: string) {
    return this.productService.findResource(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  public async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Patch(':id/inventory')
  @UsePipes(new ValidationPipe())
  public async updateInventory(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.productService.updateInventory(id, updateInventoryDto.quantity);
  }

  @Delete(':id')
  public async remove(@Param('id') id: string) {
    return this.productService.softDelete(id);
  }
}
