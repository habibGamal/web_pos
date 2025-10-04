<?php

namespace App\Filament\Resources\ProductResource\RelationManagers;

use App\Enums\ProductType;
use App\Enums\ProductUnit;
use App\Enums\StockManagerStrategy;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class VariantsRelationManager extends RelationManager
{
    protected static string $relationship = 'variants';

    protected static ?string $recordTitleAttribute = 'name_ar';

    protected static ?string $title = 'متغيرات المنتج';

    protected static ?string $modelLabel = 'متغير';

    protected static ?string $pluralModelLabel = 'متغيرات';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Tabs::make('VariantTabs')
                    ->tabs([
                        Forms\Components\Tabs\Tab::make('المعلومات الأساسية')
                            ->icon('heroicon-o-information-circle')
                            ->schema([
                                Forms\Components\TextInput::make('name_en')
                                    ->label('الاسم باللغة الإنجليزية')
                                    ->required()
                                    ->maxLength(255)
                                    ->default(fn () => $this->getOwnerRecord()->name_en),
                                Forms\Components\TextInput::make('name_ar')
                                    ->label('الاسم باللغة العربية')
                                    ->required()
                                    ->maxLength(255)
                                    ->default(fn () => $this->getOwnerRecord()->name_ar),
                                Forms\Components\TextInput::make('slug')
                                    ->label('الرابط')
                                    ->required()
                                    ->unique(ignoreRecord: true)
                                    ->maxLength(255)
                                    ->default(fn () => $this->getOwnerRecord()->slug . '-variant-' . uniqid()),
                                Forms\Components\TextInput::make('sku')
                                    ->label('رمز المنتج (SKU)')
                                    ->required()
                                    ->unique(ignoreRecord: true)
                                    ->maxLength(255)
                                    ->default(fn () => 'VAR-' . strtoupper(uniqid())),
                                Forms\Components\Toggle::make('is_default')
                                    ->label('متغير افتراضي')
                                    ->default(false)
                                    ->helperText('يجب أن يكون هناك متغير افتراضي واحد فقط لكل منتج'),
                                Forms\Components\Toggle::make('is_active')
                                    ->label('نشط')
                                    ->default(true),
                            ])
                            ->columns(2),

                        Forms\Components\Tabs\Tab::make('الوصف')
                            ->icon('heroicon-o-document-text')
                            ->schema([
                                Forms\Components\Textarea::make('description_en')
                                    ->label('الوصف باللغة الإنجليزية')
                                    ->rows(4)
                                    ->default(fn () => $this->getOwnerRecord()->description_en)
                                    ->columnSpanFull(),
                                Forms\Components\Textarea::make('description_ar')
                                    ->label('الوصف باللغة العربية')
                                    ->rows(4)
                                    ->default(fn () => $this->getOwnerRecord()->description_ar)
                                    ->columnSpanFull(),
                            ]),

                        Forms\Components\Tabs\Tab::make('التسعير')
                            ->icon('heroicon-o-currency-dollar')
                            ->schema([
                                Forms\Components\TextInput::make('price')
                                    ->label('السعر')
                                    ->required()
                                    ->numeric()
                                    ->prefix('ج.م')
                                    ->default(fn () => $this->getOwnerRecord()->price),
                                Forms\Components\TextInput::make('sale_price')
                                    ->label('سعر العرض')
                                    ->numeric()
                                    ->nullable()
                                    ->lte('price')
                                    ->prefix('ج.م')
                                    ->default(fn () => $this->getOwnerRecord()->sale_price),
                                Forms\Components\TextInput::make('cost_price')
                                    ->label('سعر التكلفة')
                                    ->numeric()
                                    ->nullable()
                                    ->prefix('ج.م')
                                    ->default(fn () => $this->getOwnerRecord()->cost_price),
                            ])
                            ->columns(3),

                        Forms\Components\Tabs\Tab::make('المخزون والصور')
                            ->icon('heroicon-o-cube')
                            ->schema([
                                Forms\Components\TextInput::make('quantity')
                                    ->label('الكمية')
                                    ->required()
                                    ->numeric()
                                    ->minValue(0)
                                    ->default(0),

                                Forms\Components\Select::make('unit')
                                    ->label('الوحدة')
                                    ->options(ProductUnit::toSelectArray())
                                    ->default(fn () => $this->getOwnerRecord()->unit)
                                    ->required(),

                                Forms\Components\Toggle::make('is_stockable')
                                    ->label('قابل للإدارة في المخزون')
                                    ->helperText('هل يتم تتبع كمية هذا المتغير في المخزون؟')
                                    ->default(fn () => $this->getOwnerRecord()->is_stockable)
                                    ->live(),

                                Forms\Components\Select::make('stock_manager')
                                    ->label('مدير المخزون')
                                    ->options(StockManagerStrategy::toSelectArray())
                                    ->default(fn () => $this->getOwnerRecord()->stock_manager)
                                    ->required()
                                    ->visible(fn (Forms\Get $get): bool => $get('is_stockable')),

                                Forms\Components\TextInput::make('pos_stock_display_percentage')
                                    ->label('نسبة عرض المخزون في نقاط البيع (%)')
                                    ->helperText('نسبة المخزون التي سيتم عرضها في نقاط البيع')
                                    ->numeric()
                                    ->minValue(1)
                                    ->maxValue(100)
                                    ->suffix('%')
                                    ->nullable()
                                    ->default(fn () => $this->getOwnerRecord()->pos_stock_display_percentage)
                                    ->visible(
                                        fn (Forms\Get $get): bool => $get('is_stockable') &&
                                        $get('stock_manager') === StockManagerStrategy::POS_STOCK_MANAGER->value
                                    ),

                                Forms\Components\FileUpload::make('images')
                                    ->label('الصور')
                                    ->image()
                                    ->multiple()
                                    ->reorderable()
                                    ->disk('public')
                                    ->directory('products/variants')
                                    ->visibility('public')
                                    ->optimize('webp')
                                    ->imageEditor()
                                    ->maxFiles(5)
                                    ->columnSpanFull(),
                            ])
                            ->columns(2),

                        Forms\Components\Tabs\Tab::make('الخصائص')
                            ->icon('heroicon-o-tag')
                            ->schema([
                                Forms\Components\Repeater::make('productAttributeValues')
                                    ->label('خصائص المتغير')
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
                                    ->columnSpanFull(),
                            ]),
                    ])
                    ->columnSpanFull()
                    ->persistTabInQueryString(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name_ar')
            ->columns([
                Tables\Columns\ImageColumn::make('featured_image')
                    ->label('الصورة')
                    ->circular()
                    ->defaultImageUrl(url('/images/placeholder.jpg')),
                Tables\Columns\TextColumn::make('name_' . app()->getLocale())
                    ->label('الاسم')
                    ->description(fn ($record): ?string => $record->sku)
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('price')
                    ->label('السعر')
                    ->money('EGP')
                    ->sortable()
                    ->description(
                        fn ($record): ?string => $record->sale_price ?
                        'عرض: ' . number_format((float) $record->sale_price, 2) . ' ج.م' : null
                    ),
                Tables\Columns\TextColumn::make('quantity')
                    ->label('المخزون')
                    ->badge()
                    ->color(fn ($record): string => match (true) {
                        $record->quantity === 0 => 'danger',
                        $record->quantity < 10 => 'warning',
                        default => 'success',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('attributes_string')
                    ->label('الخصائص')
                    ->limit(50)
                    ->tooltip(fn ($record): ?string => $record->attributes_string),
                Tables\Columns\IconColumn::make('is_default')
                    ->label('افتراضي')
                    ->boolean()
                    ->trueIcon('heroicon-o-star')
                    ->falseIcon('heroicon-o-star')
                    ->trueColor('warning')
                    ->falseColor('gray'),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('نشط')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('الحالة'),
                Tables\Filters\TernaryFilter::make('is_default')
                    ->label('افتراضي'),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->label('إضافة متغير')
                    ->mutateFormDataUsing(function (array $data): array {
                        // Set the type and parent_id for the variant
                        $data['type'] = ProductType::VARIANT;
                        $data['parent_id'] = $this->getOwnerRecord()->id;
                        $data['category_id'] = $this->getOwnerRecord()->category_id;
                        $data['brand_id'] = $this->getOwnerRecord()->brand_id;

                        // Copy parent's description if not provided
                        $data['description_en'] = $data['description_en'] ?? $this->getOwnerRecord()->description_en;
                        $data['description_ar'] = $data['description_ar'] ?? $this->getOwnerRecord()->description_ar;

                        // Copy parent's stock management settings if not explicitly set
                        $data['unit'] = $data['unit'] ?? $this->getOwnerRecord()->unit;
                        $data['is_stockable'] = $data['is_stockable'] ?? $this->getOwnerRecord()->is_stockable;
                        $data['stock_manager'] = $data['stock_manager'] ?? $this->getOwnerRecord()->stock_manager;
                        $data['pos_stock_display_percentage'] = $data['pos_stock_display_percentage'] ?? $this->getOwnerRecord()->pos_stock_display_percentage;

                        return $data;
                    })
                    ->after(function ($record) {
                        // If this is set as default, unset others
                        if ($record->is_default) {
                            $this->getOwnerRecord()->variants()
                                ->where('id', '!=', $record->id)
                                ->update(['is_default' => false]);
                        }
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->after(function ($record) {
                        // If this is set as default, unset others
                        if ($record->is_default) {
                            $this->getOwnerRecord()->variants()
                                ->where('id', '!=', $record->id)
                                ->update(['is_default' => false]);
                        }
                    }),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('activate')
                        ->label('تفعيل')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->action(fn ($records) => $records->each->update(['is_active' => true]))
                        ->deselectRecordsAfterCompletion(),
                    Tables\Actions\BulkAction::make('deactivate')
                        ->label('إلغاء التفعيل')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->action(fn ($records) => $records->each->update(['is_active' => false]))
                        ->deselectRecordsAfterCompletion(),
                ]),
            ])
            ->defaultSort('is_default', 'desc');
    }

    public static function canViewForRecord(\Illuminate\Database\Eloquent\Model $ownerRecord, string $pageClass): bool
    {
        // Only show variants relation manager for configurable products
        return $ownerRecord->type === ProductType::CONFIGURABLE;
    }
}
