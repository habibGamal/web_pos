<?php

namespace App\Filament\Resources;

use App\Enums\ProductType;
use App\Filament\Resources\ProductResource\Pages;
use App\Filament\Resources\ProductResource\RelationManagers;
use App\Models\Product;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';

    protected static ?string $navigationGroup = 'المنتجات';

    protected static ?int $navigationSort = 0;

    protected static ?string $label = 'المنتج';
    protected static ?string $pluralLabel = 'المنتجات';

    protected static ?string $recordTitleAttribute = 'name_' . 'ar';

    public static function getGloballySearchableAttributes(): array
    {
        return ['name_en', 'name_ar', 'slug', 'description_en', 'description_ar', 'sku'];
    }

    public static function getEloquentQuery(): Builder
    {
        // Only show parent products (not variants) in the main table
        return parent::getEloquentQuery()->whereIn('type', [
            ProductType::SIMPLE,
            ProductType::CONFIGURABLE,
            ProductType::BUNDLE,
        ]);
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Tabs::make('Product')
                    ->tabs([
                        Forms\Components\Tabs\Tab::make('المعلومات الأساسية')
                            ->schema([
                                Forms\Components\Select::make('type')
                                    ->label('نوع المنتج')
                                    ->options([
                                        ProductType::SIMPLE->value => ProductType::SIMPLE->label(),
                                        ProductType::CONFIGURABLE->value => ProductType::CONFIGURABLE->label(),
                                        ProductType::BUNDLE->value => ProductType::BUNDLE->label(),
                                    ])
                                    ->default(ProductType::SIMPLE->value)
                                    ->required()
                                    ->live()
                                    ->afterStateUpdated(function (Forms\Set $set, ?string $state) {
                                        if ($state === ProductType::CONFIGURABLE->value) {
                                            $set('quantity', 0);
                                            $set('sku', null);
                                            $set('images', null);
                                        }
                                    })
                                    ->disabled(
                                        fn (string $operation, Forms\Get $get, ?Product $record): bool => $operation === 'edit' &&
                                        $record?->type === ProductType::CONFIGURABLE &&
                                        $record?->variants()->exists()
                                    )
                                    ->helperText(
                                        fn (string $operation, Forms\Get $get, ?Product $record): ?string => $operation === 'edit' &&
                                        $record?->type === ProductType::CONFIGURABLE &&
                                        $record?->variants()->exists()
                                        ? 'لا يمكن تغيير نوع المنتج لوجود متغيرات. يجب حذف جميع المتغيرات أولاً.'
                                        : null
                                    ),

                                // Parent ID is only for variants and handled by relation manager

                                Forms\Components\TextInput::make('name_en')
                                    ->label('الاسم باللغة الإنجليزية')
                                    ->required()
                                    ->maxLength(255)
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(
                                        fn (Forms\Set $set, ?string $state) => $set('slug', \Illuminate\Support\Str::slug($state))
                                    ),
                                Forms\Components\TextInput::make('name_ar')
                                    ->label('الاسم باللغة العربية')
                                    ->required()
                                    ->maxLength(255),
                                Forms\Components\TextInput::make('slug')
                                    ->label('الرابط')
                                    ->required()
                                    ->unique(ignoreRecord: true)
                                    ->maxLength(255),
                                Forms\Components\TextInput::make('sku')
                                    ->label('رمز المنتج (SKU)')
                                    ->unique(ignoreRecord: true)
                                    ->maxLength(255)
                                    ->visible(fn (Forms\Get $get): bool => in_array($get('type'), [
                                        ProductType::SIMPLE->value,
                                        ProductType::VARIANT->value,
                                    ])),
                                Forms\Components\Select::make('category_id')
                                    ->label('الفئة')
                                    ->relationship('category', 'name_' . app()->getLocale())
                                    ->searchable()
                                    ->preload()
                                    ->required(),
                                Forms\Components\Select::make('brand_id')
                                    ->label('العلامة التجارية')
                                    ->relationship('brand', 'name_' . app()->getLocale())
                                    ->searchable()
                                    ->preload()
                                    ->required(),
                                Forms\Components\Toggle::make('is_active')
                                    ->label('نشط')
                                    ->default(true),
                                Forms\Components\Toggle::make('is_featured')
                                    ->label('مميز')
                                    ->default(false)
                                    ->visible(fn (Forms\Get $get): bool => $get('type') !== ProductType::CONFIGURABLE->value),
                                // is_default is only for variants and handled by relation manager
                            ]),
                        Forms\Components\Tabs\Tab::make('الوصف')
                            ->schema([
                                Forms\Components\Textarea::make('description_en')
                                    ->label('الوصف باللغة الإنجليزية')
                                    ->columnSpanFull(),
                                Forms\Components\Textarea::make('description_ar')
                                    ->label('الوصف باللغة العربية')
                                    ->columnSpanFull(),
                            ]),
                        Forms\Components\Tabs\Tab::make('التسعير')
                            ->schema([
                                Forms\Components\TextInput::make('price')
                                    ->label('السعر')
                                    ->required()
                                    ->numeric()
                                    ->prefix('ج.م'),
                                Forms\Components\TextInput::make('sale_price')
                                    ->label('سعر العرض')
                                    ->numeric()
                                    ->nullable()
                                    ->lte('price')
                                    ->prefix('ج.م'),
                                Forms\Components\TextInput::make('cost_price')
                                    ->label('سعر التكلفة')
                                    ->numeric()
                                    ->nullable()
                                    ->prefix('ج.م'),
                            ]),
                        Forms\Components\Tabs\Tab::make('المخزون والصور')
                            ->schema([
                                Forms\Components\TextInput::make('quantity')
                                    ->label('الكمية')
                                    ->numeric()
                                    ->minValue(0)
                                    ->default(0)
                                    ->visible(fn (Forms\Get $get): bool => in_array($get('type'), [
                                        ProductType::SIMPLE->value,
                                        ProductType::BUNDLE->value,
                                    ])),

                                Forms\Components\FileUpload::make('images')
                                    ->label('الصور')
                                    ->image()
                                    ->multiple()
                                    ->reorderable()
                                    ->disk('public')
                                    ->directory('products')
                                    ->visibility('public')
                                    ->optimize('webp')
                                    ->imageEditor()
                                    ->maxFiles(10)
                                    ->visible(fn (Forms\Get $get): bool => $get('type') !== ProductType::CONFIGURABLE->value),
                            ]),
                        Forms\Components\Tabs\Tab::make('الخصائص')
                            ->schema([
                                Forms\Components\Repeater::make('productAttributeValues')
                                    ->label('خصائص المنتج')
                                    ->relationship()
                                    ->schema([
                                        Forms\Components\Select::make('attribute_id')
                                            ->label('الخاصية')
                                            ->options(function () {
                                                return \App\Models\Attribute::pluck('name_' . app()->getLocale(), 'id')->toArray();
                                            })
                                            ->afterStateHydrated(function (Forms\Components\Select $component, Forms\Get $get) {
                                                $attribute = \App\Models\AttributeValue::with('attribute')
                                                    ->where('id', $get('attribute_value_id'))->first()?->attribute;
                                                if ($attribute) {
                                                    $component->state($attribute->id);
                                                }
                                            })
                                            ->required()
                                            // ->live()
                                            ->dehydrated(false)
                                            // ->afterStateUpdated(fn(Forms\Set $set) => $set('id', null))
                                            ->searchable(),
                                        Forms\Components\Select::make('attribute_value_id')
                                            ->label('الخاصية والقيمة')
                                            ->live()
                                            ->options(function (Forms\Get $get) {
                                                $locale = app()->getLocale();
                                                $attributeId = $get('attribute_id');

                                                // dd($attributeId);
                                                return \App\Models\AttributeValue::with('attribute')
                                                    ->when($attributeId, fn (Builder $query) => $query->where('attribute_id', $attributeId))
                                                    ->get()
                                                    ->mapWithKeys(function ($attributeValue) use ($locale) {
                                                        $valueName = $attributeValue->{"value_{$locale}"} ?? $attributeValue->value;

                                                        return [$attributeValue->id => $valueName];
                                                    })
                                                    ->toArray();
                                            })
                                            ->required()
                                            ->searchable(),
                                    ])
                                    ->columns(2)
                                    ->defaultItems(0)
                                    ->collapsible()
                                    ->itemLabel(function (array $state): ?string {
                                        if (! isset($state['attribute_value_id'])) {
                                            return null;
                                        }
                                        $attributeValue = \App\Models\AttributeValue::with('attribute')->find($state['attribute_value_id']);
                                        if (! $attributeValue || ! $attributeValue->attribute) {
                                            return null;
                                        }
                                        $locale = app()->getLocale();
                                        $attributeName = $attributeValue->attribute->{"name_{$locale}"} ?? $attributeValue->attribute->name;
                                        $valueName = $attributeValue->{"value_{$locale}"} ?? $attributeValue->value;

                                        return "{$attributeName}: {$valueName}";
                                    })
                                    ->visible(fn (Forms\Get $get): bool => in_array($get('type'), [
                                        ProductType::SIMPLE->value,
                                        ProductType::VARIANT->value,
                                    ])),
                            ]),
                        Forms\Components\Tabs\Tab::make('عناصر الحزمة')
                            ->schema([
                                Forms\Components\Repeater::make('bundleItems')
                                    ->label('منتجات الحزمة')
                                    ->relationship()
                                    ->schema([
                                        Forms\Components\Select::make('product_id')
                                            ->label('المنتج')
                                            ->relationship(
                                                name: 'product',
                                                titleAttribute: 'name_' . app()->getLocale(),
                                                modifyQueryUsing: fn (Builder $query) => $query
                                                    ->whereIn('type', [ProductType::SIMPLE])
                                                    ->where('is_active', true)
                                            )
                                            ->required()
                                            ->searchable()
                                            ->preload(),
                                        Forms\Components\TextInput::make('quantity')
                                            ->label('الكمية')
                                            ->numeric()
                                            ->minValue(1)
                                            ->default(1)
                                            ->required(),
                                    ])
                                    ->columns(2)
                                    ->defaultItems(0)
                                    ->collapsible()
                                    ->itemLabel(
                                        fn (array $state): ?string => isset($state['product_id']) ?
                                        Product::find($state['product_id'])?->{'name_' . app()->getLocale()} . ' (x' . ($state['quantity'] ?? 1) . ')'
                                        : null
                                    )
                                    ->visible(fn (Forms\Get $get): bool => $get('type') === ProductType::BUNDLE->value),
                            ]),
                        Forms\Components\Tabs\Tab::make('الخيارات')
                            ->schema([
                                Forms\Components\Select::make('options')
                                    ->label('خيارات المنتج')
                                    ->helperText('اختر الخيارات التي يمكن للعميل الاختيار من بينها (مثل: اللون، الحجم، الطعم)')
                                    ->relationship('options', 'name_' . app()->getLocale())
                                    ->multiple()
                                    ->preload()
                                    ->searchable()
                                    ->createOptionForm([
                                        Forms\Components\TextInput::make('name_en')
                                            ->label('الاسم (إنجليزي)')
                                            ->required()
                                            ->maxLength(255),
                                        Forms\Components\TextInput::make('name_ar')
                                            ->label('الاسم (عربي)')
                                            ->required()
                                            ->maxLength(255),
                                        Forms\Components\TagsInput::make('values')
                                            ->label('القيم')
                                            ->placeholder('أضف قيمة واضغط Enter')
                                            ->helperText('مثال: أحمر، أزرق، أخضر')
                                            ->required(),
                                    ]),
                            ]),
                    ])
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('type')
                    ->label('النوع')
                    ->formatStateUsing(fn (ProductType $state): string => $state->label())
                    ->badge()
                    ->color(fn (ProductType $state): string => match ($state) {
                        ProductType::SIMPLE => 'primary',
                        ProductType::CONFIGURABLE => 'success',
                        ProductType::VARIANT => 'warning',
                        ProductType::BUNDLE => 'info',
                    })
                    ->sortable(),
                Tables\Columns\ImageColumn::make('featured_image')
                    ->label('الصورة')
                    ->circular()
                    ->defaultImageUrl(url('/images/placeholder.jpg')),
                Tables\Columns\TextColumn::make('name_' . app()->getLocale())
                    ->label('الاسم')
                    ->description(fn (Product $record): ?string => $record->sku)
                    ->sortable()
                    ->searchable()
                    ->weight('medium'),
                Tables\Columns\TextColumn::make('price')
                    ->label('السعر')
                    ->money('EGP')
                    ->sortable()
                    ->description(
                        fn (Product $record): ?string => $record->sale_price ? 'عرض: ' . number_format((float) $record->sale_price, 2) . ' ج.م' : null
                    ),
                Tables\Columns\TextColumn::make('category.name_' . app()->getLocale())
                    ->label('الفئة')
                    ->badge()
                    ->color('gray')
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('brand.name_' . app()->getLocale())
                    ->label('العلامة التجارية')
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('الحالة')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger')
                    ->sortable(),
                Tables\Columns\TextColumn::make('total_quantity')
                    ->label('المخزون')
                    ->badge()
                    ->color(fn (Product $record): string => match (true) {
                        $record->total_quantity === 0 => 'danger',
                        $record->total_quantity < 10 => 'warning',
                        default => 'success',
                    })
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_featured')
                    ->label('مميز')
                    ->boolean()
                    ->trueIcon('heroicon-o-star')
                    ->falseIcon('heroicon-o-star')
                    ->trueColor('warning')
                    ->falseColor('gray')
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('تاريخ الإنشاء')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('تاريخ التحديث')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('نوع المنتج')
                    ->options(ProductType::options())
                    ->multiple(),
                Tables\Filters\SelectFilter::make('category_id')
                    ->label('الفئة')
                    ->relationship('category', 'name_' . app()->getLocale())
                    ->searchable()
                    ->multiple()
                    ->preload(),
                Tables\Filters\SelectFilter::make('brand_id')
                    ->label('العلامة التجارية')
                    ->relationship('brand', 'name_' . app()->getLocale())
                    ->searchable()
                    ->multiple()
                    ->preload(),
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('نشط')
                    ->placeholder('الكل')
                    ->trueLabel('نشط فقط')
                    ->falseLabel('غير نشط فقط'),
                Tables\Filters\TernaryFilter::make('is_featured')
                    ->label('مميز')
                    ->placeholder('الكل')
                    ->trueLabel('مميز فقط')
                    ->falseLabel('غير مميز فقط'),
                Tables\Filters\TernaryFilter::make('is_in_stock')
                    ->label('المخزون')
                    ->placeholder('الكل')
                    ->trueLabel('متوفر فقط')
                    ->falseLabel('غير متوفر فقط')
                    ->attribute('is_in_stock'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('activate')
                        ->label('تفعيل')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->action(fn (Collection $records) => $records->each->update(['is_active' => true]))
                        ->requiresConfirmation()
                        ->deselectRecordsAfterCompletion(),
                    Tables\Actions\BulkAction::make('deactivate')
                        ->label('إلغاء التفعيل')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->action(fn (Collection $records) => $records->each->update(['is_active' => false]))
                        ->requiresConfirmation()
                        ->deselectRecordsAfterCompletion(),
                    Tables\Actions\BulkAction::make('feature')
                        ->label('تمييز')
                        ->icon('heroicon-o-star')
                        ->color('warning')
                        ->action(fn (Collection $records) => $records->each->update(['is_featured' => true]))
                        ->requiresConfirmation()
                        ->deselectRecordsAfterCompletion(),
                    Tables\Actions\BulkAction::make('unfeature')
                        ->label('إلغاء التمييز')
                        ->icon('heroicon-o-no-symbol')
                        ->color('gray')
                        ->action(fn (Collection $records) => $records->each->update(['is_featured' => false]))
                        ->requiresConfirmation()
                        ->deselectRecordsAfterCompletion(),
                    Tables\Actions\BulkAction::make('applyOptions')
                        ->label('تطبيق خيارات')
                        ->icon('heroicon-o-adjustments-horizontal')
                        ->color('info')
                        ->form([
                            Forms\Components\Select::make('options')
                                ->label('اختر الخيارات')
                                ->helperText('سيتم إضافة هذه الخيارات لجميع المنتجات المحددة')
                                ->options(function () {
                                    return \App\Models\Option::pluck('name_' . app()->getLocale(), 'id')->toArray();
                                })
                                ->multiple()
                                ->preload()
                                ->searchable()
                                ->required(),
                        ])
                        ->action(function (Collection $records, array $data): void {
                            foreach ($records as $record) {
                                $record->options()->syncWithoutDetaching($data['options']);
                            }
                        })
                        ->requiresConfirmation()
                        ->deselectRecordsAfterCompletion(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\VariantsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
            'view' => Pages\ViewProduct::route('/{record}'),
        ];
    }
}
