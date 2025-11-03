"""폴더 내 이미지를 퍼센트 비율로 일괄 리사이징하는 스크립트."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Iterable

from PIL import Image


SUPPORTED_SUFFIXES = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}


def iter_image_files(directory: Path, recursive: bool = False) -> Iterable[Path]:
    """디렉터리에서 이미지 파일 목록을 생성한다."""

    if recursive:
        yield from (path for path in directory.rglob('*') if path.is_file() and path.suffix.lower() in SUPPORTED_SUFFIXES)
    else:
        yield from (path for path in directory.iterdir() if path.is_file() and path.suffix.lower() in SUPPORTED_SUFFIXES)


def resize_image(src: Path, dst: Path, scale: float) -> None:
    """단일 이미지를 지정된 배율로 리사이징한다."""

    with Image.open(src) as image:
        new_width = max(1, int(image.width * scale))
        new_height = max(1, int(image.height * scale))

        resized = image.resize((new_width, new_height), Image.LANCZOS)
        resized.save(dst)


def resize_directory(src_dir: Path, scale_percent: float, output_dir: Path | None, recursive: bool) -> None:
    """디렉터리 내 모든 이미지를 배율에 맞게 리사이징한다."""

    scale = scale_percent / 100.0
    if scale <= 0:
        raise ValueError('scale_percent 는 0보다 커야 합니다.')

    if output_dir is None:
        output_dir = src_dir / 'resized'

    output_dir.mkdir(parents=True, exist_ok=True)

    images = list(iter_image_files(src_dir, recursive=recursive))
    if not images:
        print('이미지 파일을 찾지 못했습니다.')
        return

    for image_path in images:
        relative = image_path.relative_to(src_dir)
        destination = output_dir / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        resize_image(image_path, destination, scale)
        print(f'리사이징 완료: {image_path.name} -> {destination}')

    print(f'총 {len(images)}개의 이미지가 {scale_percent}% 비율로 저장되었습니다. 출력 경로: {output_dir}')


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='폴더 내 모든 이미지를 퍼센트 비율로 리사이징합니다.')
    parser.add_argument('directory', type=Path, help='이미지들이 있는 폴더 경로')
    parser.add_argument('scale_percent', type=float, help='리사이징 비율 (예: 50 은 50%)')
    parser.add_argument('-o', '--output', type=Path, default=None, help='출력 폴더 (기본값: <directory>/resized)')
    parser.add_argument('-r', '--recursive', action='store_true', help='하위 폴더까지 포함할지 여부')
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    resize_directory(args.directory.resolve(), args.scale_percent, args.output, args.recursive)


if __name__ == '__main__':
    main()

