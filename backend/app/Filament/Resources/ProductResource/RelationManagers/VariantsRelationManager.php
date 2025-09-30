<?php

namespace App\Filament\Resources\ProductResource\RelationManagers;

use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class VariantsRelationManager extends RelationManager
{
    protected static string $relationship = 'variants';

    protected static ?string $recordTitleAttribute = 'sku';

    protected static ?string $pluralLabel = 'متغيرات المنتج';

    protected static ?string $label = 'متغير';

    protected static ?string $title = 'متغيرات المنتج';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('sku')
                    ->label('رمز المنتج (SKU)')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255),

                Forms\Components\TextInput::make('price')
                    ->label('السعر')
                    ->numeric()
                    ->prefix('ج.م'),

                Forms\Components\TextInput::make('sale_price')
                    ->label('سعر العرض')
                    ->numeric()
                    ->nullable()
                    ->lte('price')
                    ->prefix('ج.م'),

                Forms\Components\TextInput::make('quantity')
                    ->label('الكمية')
                    ->required()
                    ->numeric()
                    ->minValue(0)
                    ->default(0),

                Forms\Components\Repeater::make('variant_attributes')
                    ->label('خصائص المنتج')
                    ->schema([
                        Forms\Components\Select::make('attribute_id')
                            ->label('الخاصية')
                            ->options(function (callable $get) {
                                $locale = app()->getLocale();
                                $allAttributes = \App\Models\Attribute::orderBy('sort_order')
                                    ->pluck("name_{$locale}", 'id')
                                    ->toArray();

                                // Get already selected attributes from other repeater items
                                $currentIndex = $get('attribute_id') ? array_search($get('attribute_id'), array_keys($allAttributes)) : null;
                                $selectedAttributes = collect($get('../../'))
                                    ->pluck('attribute_id')
                                    ->filter()
                                    ->unique()
                                    ->values()
                                    ->toArray();

                                // Remove already selected attributes (except current one)
                                foreach ($selectedAttributes as $selectedId) {
                                    if ($selectedId != $get('attribute_id')) {
                                        unset($allAttributes[$selectedId]);
                                    }
                                }

                                return $allAttributes;
                            })
                            ->required()
                            ->reactive()
                            ->afterStateUpdated(fn (callable $set) => $set('attribute_value_id', null))
                            ->searchable(),

                        Forms\Components\Select::make('attribute_value_id')
                            ->label('القيمة')
                            ->options(function (callable $get) {
                                $attributeId = $get('attribute_id');
                                if (! $attributeId) {
                                    return [];
                                }

                                $locale = app()->getLocale();
                                $attribute = \App\Models\Attribute::find($attributeId);

                                if (! $attribute) {
                                    return [];
                                }

                                return \App\Models\AttributeValue::where('attribute_id', $attributeId)
                                    ->orderBy('sort_order')
                                    ->get()
                                    ->mapWithKeys(function ($value) use ($locale, $attribute) {
                                        $displayValue = $value->{"value_{$locale}"} ?? $value->value;

                                        // Add color indicator for color attributes
                                        if ($attribute->type->value === 'color' && $value->color_code) {
                                            $displayValue = "🎨 {$displayValue}";
                                        }

                                        return [$value->id => $displayValue];
                                    })
                                    ->toArray();
                            })
                            ->required()
                            ->reactive()
                            ->searchable(),
                    ])
                    ->columns(2)
                    ->defaultItems(0)
                    ->collapsible()
                    ->itemLabel(function (array $state): ?string {
                        if (! isset($state['attribute_id']) || ! isset($state['attribute_value_id'])) {
                            return null;
                        }

                        $locale = app()->getLocale();
                        $attribute = \App\Models\Attribute::find($state['attribute_id']);
                        $attributeValue = \App\Models\AttributeValue::find($state['attribute_value_id']);

                        if (! $attribute || ! $attributeValue) {
                            return null;
                        }

                        $attributeName = $attribute->{"name_{$locale}"} ?? $attribute->name_en;
                        $displayValue = $attributeValue->{"value_{$locale}"} ?? $attributeValue->value;

                        return "{$attributeName}: {$displayValue}";
                    })
                    ->dehydrated(false)
                    ->afterStateHydrated(function (Forms\Components\Repeater $component, $state, $record) {
                        if (! $record) {
                            return;
                        }

                        $attributeValues = $record->attributeValues()->with('attribute')->get();
                        $formattedData = $attributeValues->map(function ($attributeValue) {
                            return [
                                'attribute_id' => $attributeValue->attribute_id,
                                'attribute_value_id' => $attributeValue->id,
                            ];
                        })->toArray();

                        $component->state($formattedData);
                    })
                    ->rules([
                        function () {
                            return function (string $attribute, $value, \Closure $fail) {
                                if (! is_array($value)) {
                                    return;
                                }

                                $attributeIds = collect($value)->pluck('attribute_id')->filter();
                                $duplicates = $attributeIds->duplicates();

                                if ($duplicates->isNotEmpty()) {
                                    $duplicateAttribute = \App\Models\Attribute::find($duplicates->first());
                                    $locale = app()->getLocale();
                                    $attributeName = $duplicateAttribute ? ($duplicateAttribute->{"name_{$locale}"} ?? $duplicateAttribute->name_en) : 'Unknown';
                                    $fail("لا يمكن تكرار الخاصية '{$attributeName}'. كل خاصية يجب أن تظهر مرة واحدة فقط.");
                                }
                            };
                        },
                    ]),

                Forms\Components\FileUpload::make('images')
                    ->label('الصور')
                    ->image()
                    ->multiple()
                    ->reorderable()
                    ->disk('public')
                    ->directory('product-variants')
                    ->visibility('public')
                    ->optimize('webp')
                    ->imageEditor()
                    ->maxFiles(5),

                Forms\Components\Toggle::make('is_default')
                    ->label('افتراضي')
                    ->default(false),

                Forms\Components\Toggle::make('is_active')
                    ->label('نشط')
                    ->default(true),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('sku')
                    ->label('رمز المنتج (SKU)')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\ImageColumn::make('featured_image')
                    ->label('الصورة')
                    ->circular(),

                Tables\Columns\TextColumn::make('price')
                    ->label('السعر')
                    ->money('EGP')
                    ->sortable(),

                Tables\Columns\TextColumn::make('sale_price')
                    ->label('سعر العرض')
                    ->money('EGP')
                    ->sortable(),

                Tables\Columns\TextColumn::make('quantity')
                    ->label('الكمية')
                    ->sortable()
                    ->badge()
                    ->color(fn ($record) => $record->quantity > 0 ? 'success' : 'danger'),

                Tables\Columns\TextColumn::make('attributes_string')
                    ->label('الخصائص')
                    ->searchable(false)
                    ->wrap(),

                Tables\Columns\IconColumn::make('is_default')
                    ->label('افتراضي')
                    ->boolean()
                    ->sortable(),

                Tables\Columns\IconColumn::make('is_active')
                    ->label('نشط')
                    ->boolean()
                    ->sortable(),

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
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('نشط')
                    ->placeholder('الكل')
                    ->trueLabel('نشط فقط')
                    ->falseLabel('غير نشط فقط'),

                Tables\Filters\TernaryFilter::make('is_default')
                    ->label('افتراضي')
                    ->placeholder('الكل')
                    ->trueLabel('افتراضي فقط')
                    ->falseLabel('غير افتراضي فقط'),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->using(function (array $data, string $model): \Illuminate\Database\Eloquent\Model {
                        // Extract variant attributes data
                        $variantAttributes = $data['variant_attributes'] ?? [];
                        unset($data['variant_attributes']);

                        // Create the variant
                        $variant = $model::create($data);

                        // Sync attribute values
                        $attributeValueIds = collect($variantAttributes)
                            ->pluck('attribute_value_id')
                            ->filter()
                            ->unique()
                            ->values()
                            ->toArray();

                        if (! empty($attributeValueIds)) {
                            $variant->attributeValues()->sync($attributeValueIds);
                        }

                        return $variant;
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->using(function (\Illuminate\Database\Eloquent\Model $record, array $data): \Illuminate\Database\Eloquent\Model {
                        // Extract variant attributes data
                        $variantAttributes = $data['variant_attributes'] ?? [];
                        unset($data['variant_attributes']);

                        // Update the variant
                        $record->update($data);

                        // Sync attribute values
                        $attributeValueIds = collect($variantAttributes)
                            ->pluck('attribute_value_id')
                            ->filter()
                            ->unique()
                            ->values()
                            ->toArray();

                        $record->attributeValues()->sync($attributeValueIds);

                        return $record;
                    }),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}
