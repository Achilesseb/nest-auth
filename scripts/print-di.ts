import { NestFactory } from '@nestjs/core';
import { SpelunkerModule } from 'nestjs-spelunker';
import { AppModule } from 'src/modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Explore the dependency graph
  const tree = SpelunkerModule.explore(app);
  const root = SpelunkerModule.graph(tree);
  const edges = SpelunkerModule.findGraphEdges(root);

  console.log('graph LR');
  const mermaidEdges = edges.map(
    ({}) =>
      `  <span class="math-inline">\{from\.module\.name\}\-\-\></span>{to.module.name}`,
  );
  console.log(mermaidEdges.join('\n'));

  await app.close(); // Close the application after printing
}

bootstrap();
