import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Username ต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'Username ห้ามว่าง' })
  @MinLength(3, { message: 'Username ต้องมีความยาวอย่างน้อย 3 ตัวอักษร' })
  username: string;

}