<?php

namespace App\Filament\Resources\ProductResource\Pages;

use App\Enums\ProductType;
use App\Filament\Resources\ProductResource;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;

class EditProduct extends EditRecord
{
    protected static string $resource = ProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make()
                ->before(function () {
                    // Check if configurable product has variants
                    if ($this->record->type === ProductType::CONFIGURABLE && $this->record->variants()->exists()) {
                        Notification::make()
                            ->title('لا يمكن حذف المنتج')
                            ->body('يجب حذف جميع المتغيرات أولاً قبل حذف المنتج القابل للتكوين.')
                            ->danger()
                            ->send();

                        $this->halt();
                    }
                }),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    protected function getSavedNotificationTitle(): ?string
    {
        return 'تم تحديث المنتج بنجاح';
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        // Prevent changing type if configurable product has variants
        if ($this->record->type === ProductType::CONFIGURABLE &&
            isset($data['type']) &&
            $data['type'] !== ProductType::CONFIGURABLE->value &&
            $this->record->variants()->exists()) {

            Notification::make()
                ->title('لا يمكن تغيير نوع المنتج')
                ->body('يجب حذف جميع المتغيرات أولاً قبل تغيير نوع المنتج.')
                ->danger()
                ->send();

            // Revert the type back to configurable
            $data['type'] = ProductType::CONFIGURABLE->value;
        }

        return $data;
    }
}
