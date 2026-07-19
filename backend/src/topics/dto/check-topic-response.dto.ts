export class CheckTopicResponseDto {
  available!: boolean;

  student?: {
    id: string;
    name: string;
  };
}