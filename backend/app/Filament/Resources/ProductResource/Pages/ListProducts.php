<?php

namespace App\Filament\Resources\ProductResource\Pages;

use App\Enums\ProductType;
use App\Filament\Exports\ProductExporter;
use App\Filament\Imports\ProductImporter;
use App\Filament\Resources\ProductResource;
use App\Models\Product;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListProducts extends ListRecords
{
    protected static string $resource = ProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ExportAction::make()
                ->label('تصدير المنتجات')
                ->exporter(ProductExporter::class)
                ->modifyQueryUsing(
                    fn () => Product::query()
                        ->where('type', ProductType::VARIANT)
                        ->with(['parent.category', 'parent.brand'])
                ),
            Actions\ImportAction::make()
                ->label('استيراد المنتجات')
                ->importer(ProductImporter::class),
            Actions\CreateAction::make(),
        ];
    }
}
