<?php

namespace App\Filament\Resources\ProductResource\RelationManagers;

use App\Enums\ProductType;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

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
                                Forms\Components\Repeater::make('attributeValues')
                                    ->label('خصائص المتغير')
                                    ->relationship()
                                    ->schema([
                                        Forms\Components\Select::make('attribute_id')
                                            ->label('الخاصية')
                                            ->options(function () {
                                                return \App\Models\Attribute::pluck('name_' . app()->getLocale(), 'id')->toArray();
                                            })
                                            ->required()
                                            ->live()
                                            ->afterStateUpdated(fn (Forms\Set $set) => $set('id', null))
                                            ->searchable(),
                                        Forms\Components\Select::make('id')
                                            ->label('القيمة')
                                            ->options(function (Forms\Get $get) {
                                                $attributeId = $get('attribute_id');
                                                if (! $attributeId) {
                                                    return [];
                                                }
                                                $locale = app()->getLocale();

                                                return \App\Models\AttributeValue::where('attribute_id', $attributeId)
                                                    ->orderBy('sort_order')
                                                    ->get()
                                                    ->mapWithKeys(function ($attributeValue) use ($locale) {
                                                        $displayValue = $attributeValue->{"value_{$locale}"} ?? $attributeValue->value;

                                                        return [$attributeValue->id => $displayValue];
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
                                        if (! isset($state['attribute_id']) || ! isset($state['id'])) {
                                            return null;
                                        }
                                        $attribute = \App\Models\Attribute::find($state['attribute_id']);
                                        $attributeValue = \App\Models\AttributeValue::find($state['id']);
                                        if (! $attribute || ! $attributeValue) {
                                            return null;
                                        }

                                        return $attribute->{'name_' . app()->getLocale()} . ': ' . $attributeValue->display_value;
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
