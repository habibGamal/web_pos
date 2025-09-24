<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use League\Glide\Responses\PsrResponseFactory;
use League\Glide\ServerFactory;
use Spatie\Glide\GlideImage;

class ImageController extends Controller
{
    public function show($path)
    {
        // dd(storage_path('app/public/' . $path));

        // file name merged with w ,h ,q params
        $outFileName = pathinfo($path, PATHINFO_FILENAME)
            . (request()->has('w') ? '_w' . request()->get('w') : '')
            . (request()->has('h') ? '_h' . request()->get('h') : '')
            . (request()->has('q') ? '_q' . request()->get('q') : '')
            . '.' . pathinfo($path, PATHINFO_EXTENSION);
        $outFilePath = storage_path('app/public/cache/' . $outFileName);
        $generagedImgPath = GlideImage::create(storage_path('app/public/' . $path))
            ->modify(request()->all())
            ->save($outFilePath);



        return response()->file($generagedImgPath);
    }
}
