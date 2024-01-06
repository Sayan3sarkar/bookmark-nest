import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class EditBookmarkDTO {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  link?: string;
}
