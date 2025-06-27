from PIL import Image

def split_image_grid(image_path, output_folder="output_images", padding_threshold=5, min_width=50, min_height=50):
    """
    Разделяет сетку изображений на отдельные файлы.

    Args:
        image_path (str): Путь к входному изображению с сеткой.
        output_folder (str): Папка для сохранения отдельных изображений.
        padding_threshold (int): Пороговое значение для определения белых разделителей (в пикселях).
                                 Если полоса пикселей шире этого значения и полностью белая,
                                 она считается разделителем.
        min_width (int): Минимальная ширина, чтобы считать найденную область изображением.
        min_height (int): Минимальная высота, чтобы считать найденную область изображением.
    """
    try:
        img = Image.open(image_path)
    except FileNotFoundError:
        print(f"Ошибка: Файл не найден по пути {image_path}")
        return
    except Exception as e:
        print(f"Ошибка при открытии изображения: {e}")
        return

    # Преобразуем изображение в режим RGB, если оно не в нем (например, для PNG с палитрой)
    img = img.convert("RGB")

    width, height = img.size
    pixels = img.load()

    # Создаем папку для вывода, если ее нет
    import os
    os.makedirs(output_folder, exist_ok=True)

    # Функция для проверки, является ли полоса пикселей белой
    def is_white_strip(pixels, start_coord_range_min, start_coord_range_max, fixed_coord, is_vertical=True):
            if is_vertical: # Проверяем вертикальную полосу (фиксированная X, переменная Y)
                # fixed_coord здесь это X
                # start_coord_range_min и start_coord_range_max это диапазон Y
                for y in range(start_coord_range_min, start_coord_range_max):
                    for x_offset in range(fixed_coord, fixed_coord + padding_threshold):
                        # Убедимся, что x_offset не выходит за границы ширины изображения
                        if x_offset >= width:
                            return False # Или можно проигнорировать, если это край
                        r, g, b = pixels[x_offset, y]
                        if not (r > 240 and g > 240 and b > 240): # Почти белый
                            return False
                return True
            else: # Проверяем горизонтальную полосу (фиксированная Y, переменная X)
                # fixed_coord здесь это Y
                # start_coord_range_min и start_coord_range_max это диапазон X
                for x in range(start_coord_range_min, start_coord_range_max):
                    for y_offset in range(fixed_coord, fixed_coord + padding_threshold):
                        # Убедимся, что y_offset не выходит за границы высоты изображения
                        if y_offset >= height:
                            return False # Или можно проигнорировать, если это край
                        r, g, b = pixels[x, y_offset]
                        if not (r > 240 and g > 240 and b > 240):
                            return False
                return True
    # Находим горизонтальные разделители (строки)
    horizontal_dividers = [0]
    for y in range(height):
        # Проверяем, является ли текущая строка началом белой полосы разделителя
        # Считаем строку белой, если среднее значение всех пикселей в ней очень близко к белому
        row_pixels = [pixels[x, y] for x in range(width)]
        avg_color = sum(c for p in row_pixels for c in p) / (len(row_pixels) * 3)
        if avg_color > 240:
            # Проверяем, является ли это началом достаточно широкой белой полосы
            if y + padding_threshold < height and is_white_strip(pixels, 0, width, y, is_vertical=False):
                horizontal_dividers.append(y)
                # Перепрыгиваем через уже найденную белую полосу, чтобы избежать дублирования
                y += padding_threshold
    horizontal_dividers.append(height) # Добавляем нижнюю границу

    # Находим вертикальные разделители (столбцы)
    vertical_dividers = [0]
    for x in range(width):
        # Проверяем, является ли текущий столбец началом белой полосы разделителя
        col_pixels = [pixels[x, y] for y in range(height)]
        avg_color = sum(c for p in col_pixels for c in p) / (len(col_pixels) * 3)
        if avg_color > 240:
            if x + padding_threshold < width and is_white_strip(pixels, 0, height, x, is_vertical=True):
                vertical_dividers.append(x)
                x += padding_threshold
    vertical_dividers.append(width) # Добавляем правую границу

    image_count = 0
    # Обрезаем и сохраняем каждое изображение
    for i in range(len(horizontal_dividers) - 1):
        y1 = horizontal_dividers[i]
        y2 = horizontal_dividers[i+1]

        # Если это не последний разделитель, то y2 - это начало следующей белой полосы
        # Нужно найти конец белой полосы, чтобы получить границу изображения
        if i < len(horizontal_dividers) - 2:
            # Ищем, где заканчивается белая полоса и начинается следующее изображение
            # Для этого сканируем вниз от y1, пока не найдем не-белые пиксели
            found_image_start_y = -1
            for current_y in range(y1, y2):
                is_row_white = True
                for x_check in range(width):
                    r, g, b = pixels[x_check, current_y]
                    if not (r > 240 and g > 240 and b > 240):
                        is_row_white = False
                        break
                if not is_row_white:
                    found_image_start_y = current_y
                    break
            if found_image_start_y == -1: # Вся секция белая, пропускаем
                continue
            y1 = found_image_start_y

            # Ищем, где заканчивается текущее изображение и начинается белая полоса
            found_image_end_y = -1
            for current_y in range(y2 - 1, y1, -1):
                is_row_white = True
                for x_check in range(width):
                    r, g, b = pixels[x_check, current_y]
                    if not (r > 240 and g > 240 and b > 240):
                        is_row_white = False
                        break
                if not is_row_white:
                    found_image_end_y = current_y + 1 # +1 чтобы включить последний пиксель изображения
                    break
            if found_image_end_y == -1: # Вся секция белая, пропускаем
                continue
            y2 = found_image_end_y

        # Для последней строки картинок
        else:
            found_image_start_y = -1
            for current_y in range(y1, y2):
                is_row_white = True
                for x_check in range(width):
                    r, g, b = pixels[x_check, current_y]
                    if not (r > 240 and g > 240 and b > 240):
                        is_row_white = False
                        break
                if not is_row_white:
                    found_image_start_y = current_y
                    break
            if found_image_start_y == -1: # Вся секция белая, пропускаем
                continue
            y1 = found_image_start_y
            # y2 остается height, если это последняя часть

        # Пропускаем, если высота слишком мала (скорее всего, это просто разделитель)
        if y2 - y1 < min_height:
            continue


        for j in range(len(vertical_dividers) - 1):
            x1 = vertical_dividers[j]
            x2 = vertical_dividers[j+1]

            # Аналогично для вертикальных разделителей
            if j < len(vertical_dividers) - 2:
                found_image_start_x = -1
                for current_x in range(x1, x2):
                    is_col_white = True
                    for y_check in range(height):
                        r, g, b = pixels[current_x, y_check]
                        if not (r > 240 and g > 240 and b > 240):
                            is_col_white = False
                            break
                    if not is_col_white:
                        found_image_start_x = current_x
                        break
                if found_image_start_x == -1:
                    continue
                x1 = found_image_start_x

                found_image_end_x = -1
                for current_x in range(x2 - 1, x1, -1):
                    is_col_white = True
                    for y_check in range(height):
                        r, g, b = pixels[current_x, y_check]
                        if not (r > 240 and g > 240 and b > 240):
                            is_col_white = False
                            break
                    if not is_col_white:
                        found_image_end_x = current_x + 1
                        break
                if found_image_end_x == -1:
                    continue
                x2 = found_image_end_x

            else:
                found_image_start_x = -1
                for current_x in range(x1, x2):
                    is_col_white = True
                    for y_check in range(height):
                        r, g, b = pixels[current_x, y_check]
                        if not (r > 240 and g > 240 and b > 240):
                            is_col_white = False
                            break
                    if not is_col_white:
                        found_image_start_x = current_x
                        break
                if found_image_start_x == -1:
                    continue
                x1 = found_image_start_x
                # x2 остается width

            if x2 - x1 < min_width:
                continue

            # Обрезаем изображение
            cropped_img = img.crop((x1, y1, x2, y2))

            # Проверяем, не является ли обрезанная область полностью белой или слишком маленькой
            if cropped_img.width > min_width and cropped_img.height > min_height:
                # Простая проверка, что изображение не полностью белое
                if any(p[0] < 240 or p[1] < 240 or p[2] < 240 for p in cropped_img.getdata()):
                    output_filename = os.path.join(output_folder, f"image_{image_count:03d}.png")
                    cropped_img.save(output_filename)
                    image_count += 1
                    print(f"Сохранено: {output_filename}")

    print(f"Всего сохранено {image_count} изображений.")

# Пример использования:
# Замените 'image.png' на путь к вашему файлу изображения
# Запустите эту функцию, указав путь к вашему изображению
split_image_grid('./imaginarium.jpg', output_folder='output_cards')
